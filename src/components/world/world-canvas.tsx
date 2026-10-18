"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { WorldProps } from "@/lib/world";
import { createMaterials, SceneSlot, sceneComponents } from "./scenes";

function Studio({ onError }: Pick<WorldProps, "onError">) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const studio = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(studio, .025);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.1;
    studio.dispose();
    generator.dispose();
    const lost = (event: Event) => {
      event.preventDefault();
      onError("The 3D illustration stopped. All company information remains available.");
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", lost);
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene, onError]);
  return null;
}

function Driver({ world, motionEnabled, poster, onReady }: Pick<WorldProps, "world" | "motionEnabled" | "poster" | "onReady">) {
  const { invalidate, gl } = useThree();
  const frames = useRef(0);
  const announced = useRef(false);

  useEffect(() => {
    let handle = 0;
    let tick = 0;
    let pending = 0;
    let last = performance.now();
    const animate = motionEnabled && !poster;
    const loop = (now: number) => {
      const state = world.current;
      if (animate) pending += Math.min((now - last) / 1000, .1);
      last = now;
      tick++;
      const step = animate && tick % 2 === 0;
      if (step) {
        state.time += pending;
        pending = 0;
      }
      if (state.dirty || state.settling || step) {
        state.dirty = false;
        state.settling = false;
        invalidate();
      }
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [world, motionEnabled, poster, invalidate]);

  useFrame(() => {
    frames.current++;
    const canvas = gl.domElement;
    canvas.dataset.time = world.current.time.toFixed(2);
    if (frames.current % 6 === 0) {
      canvas.dataset.drawCalls = String(gl.info.render.calls);
      canvas.dataset.triangles = String(gl.info.render.triangles);
      canvas.dataset.scene = world.current.scene ?? "";
    }
    if (!announced.current) {
      announced.current = true;
      onReady();
    }
  });
  return null;
}

export function WorldCanvas(props: WorldProps) {
  const materials = useMemo(createMaterials, []);
  useEffect(() => () => Object.values(materials).forEach(material => material.dispose()), [materials]);
  const compact = typeof window !== "undefined" && window.innerWidth < 800;
  const scenes = props.poster ? [props.poster] : props.scenes;

  return <Canvas
    dpr={compact ? 1 : [1, 1.5]}
    camera={{ position: [0, .6, 12], fov: 35, near: .1, far: 60 }}
    frameloop="demand"
    gl={{ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: Boolean(props.poster) }}
    onCreated={({ gl, camera }) => {
      gl.setClearColor(0x000000, 0);
      gl.toneMappingExposure = 1.3;
      camera.lookAt(0, 0, 0);
    }}>
    <ambientLight intensity={.5} color="#d4eaff" />
    <directionalLight position={[-5, 6, 5]} intensity={3.6} color="#ffd7ab" />
    <directionalLight position={[5, 2, -3]} intensity={4} color="#8cc9e7" />
    <directionalLight position={[0, 6, 2]} intensity={2} color="#fff4df" />
    <Studio onError={props.onError} />
    {scenes.map(key => {
      const Scene = sceneComponents[key];
      return <SceneSlot key={key} scene={key} world={props.world}><Scene m={materials} world={props.world} scene={key} /></SceneSlot>;
    })}
    <Driver world={props.world} motionEnabled={props.motionEnabled} poster={props.poster} onReady={props.onReady} />
  </Canvas>;
}
