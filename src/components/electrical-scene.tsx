"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3, CircleGeometry, Color, Group, LatheGeometry, MeshStandardMaterial, Quaternion, RingGeometry,
  PerspectiveCamera, PMREMGenerator, SRGBColorSpace, CanvasTexture,
  RepeatWrapping, TubeGeometry, Vector2, Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { WorldProps } from "@/lib/world";

const radius = 1.13;

function CableAssembly() {
  const resources = useMemo(() => {
    const sheath = new LatheGeometry([
      new Vector2(radius, -5.2), new Vector2(radius, 0),
      new Vector2(radius - .025, .05), new Vector2(radius - .11, .025),
      new Vector2(radius - .14, -.04), new Vector2(radius - .14, -5.2),
    ], 80);
    const ring = new LatheGeometry([
      new Vector2(.91, -.15), new Vector2(.91, .09), new Vector2(1.005, .09),
      new Vector2(1.015, .045), new Vector2(1.015, -.15),
    ], 80);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create the cable surface.");
    const pixels = context.createImageData(128, 128);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const noise = Math.sin(i * 12.9898) * 43758.5453;
      const value = 125 + (noise - Math.floor(noise)) * 70;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const grain = new CanvasTexture(canvas);
    grain.wrapS = grain.wrapT = RepeatWrapping;
    grain.repeat.set(8, 14);
    const cores = [
      { x: -.47, z: -.24, dx: -1.14, dz: -.1, end: 3.1, colour: "#254563" },
      { x: .45, z: -.23, dx: .86, dz: -.33, end: 3.65, colour: "#ded4bf" },
      { x: 0, z: .53, dx: .22, dz: .98, end: 2.65, colour: "#424b4c" },
    ].map(core => {
      const center = (t: number) => new Vector3(
        core.x + core.dx * Math.pow(t, 1.6),
        -.4 + (core.end + .4) * t,
        core.z + core.dz * Math.pow(t, 1.7),
      );
      const insulationPoints = Array.from({ length: 18 }, (_, i) => center(i / 17 * .54));
      const insulation = new TubeGeometry(new CatmullRomCurve3(insulationPoints), 40, .39, 36, false);
      const strands: (TubeGeometry | CircleGeometry)[] = [];
      const strandOffsets: [number, number][] = [[0, 0]];
      for (const [count, r] of [[6, .115], [12, .23]]) {
        for (let n = 0; n < count; n++) strandOffsets.push([Math.cos(n / count * Math.PI * 2) * r, Math.sin(n / count * Math.PI * 2) * r]);
      }
      for (const [x, z] of strandOffsets) {
        const points = Array.from({ length: 36 }, (_, i) => {
          const t = .51 + i / 35 * .49;
          const angle = t * 2.2;
          const point = center(t);
          point.x += x * Math.cos(angle) - z * Math.sin(angle);
          point.z += x * Math.sin(angle) + z * Math.cos(angle);
          return point;
        });
        const curve = new CatmullRomCurve3(points);
        strands.push(new TubeGeometry(curve, 40, .052, 8, false));
        const cap = new CircleGeometry(.052, 8);
        const tangent = curve.getTangent(1);
        cap.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), tangent));
        cap.translate(points[35].x, points[35].y, points[35].z);
        strands.push(cap);
      }
      const copper = mergeGeometries(strands);
      strands.forEach(geometry => geometry.dispose());
      if (!copper) throw new Error("Unable to generate conductor geometry.");
      const face = new RingGeometry(.3, .39, 36);
      const cut = center(.54);
      face.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), center(.55).sub(center(.53)).normalize()));
      face.translate(cut.x, cut.y, cut.z);
      return { ...core, insulation, copper, face };
    });
    const sleeve = new MeshStandardMaterial({ color: "#111b23", roughness: .43, metalness: .2, bumpMap: grain, bumpScale: .012 });
    return { sheath, ring, grain, cores, sleeve };
  }, []);

  useEffect(() => () => {
    resources.sheath.dispose();
    resources.ring.dispose();
    resources.grain.dispose();
    resources.sleeve.dispose();
    resources.cores.forEach(core => { core.insulation.dispose(); core.copper.dispose(); core.face.dispose(); });
  }, [resources]);

  return <group>
    <mesh geometry={resources.sheath} material={resources.sleeve} />
    <mesh geometry={resources.ring}><meshStandardMaterial color="#778791" metalness={.88} roughness={.32} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.09, 0]}><circleGeometry args={[.98, 64]} /><meshStandardMaterial color="#41403a" roughness={.88} /></mesh>
    {resources.cores.map((core, index) => <group key={index}>
      <mesh geometry={core.insulation}><meshStandardMaterial color={core.colour} roughness={.32} metalness={.05} /></mesh>
      <mesh geometry={core.face}><meshStandardMaterial color={core.colour} roughness={.6} /></mesh>
      <mesh geometry={core.copper}><meshStandardMaterial color="#b97742" metalness={.96} roughness={.24} /></mesh>
    </group>)}
    {[-4.5, -3.8, -3.1].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.132, .012, 6, 80]} /><meshStandardMaterial color="#465760" roughness={.7} /></mesh>)}
  </group>;
}

function Studio({ onReady, onError }: Pick<WorldProps, "onReady" | "onError">) {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const studio = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(studio, .025);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.15;
    studio.dispose();
    generator.dispose();
    const lost = (event: Event) => {
      event.preventDefault();
      onError("The 3D illustration stopped. All company information remains available.");
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    const first = requestAnimationFrame(() => { invalidate(); });
    const timer = setTimeout(onReady, 180);
    return () => {
      cancelAnimationFrame(first);
      clearTimeout(timer);
      gl.domElement.removeEventListener("webglcontextlost", lost);
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene, invalidate, onReady, onError]);
  return null;
}

function CameraAndModel({ motion, route, motionEnabled }: WorldProps) {
  const object = useRef<Group>(null);
  const { camera, size, gl, invalidate } = useThree();
  const elapsed = useRef(0);
  const frames = useRef(0);
  const vector = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  useEffect(() => {
    const refresh = () => invalidate();
    window.addEventListener("world-control", refresh);
    invalidate();
    return () => window.removeEventListener("world-control", refresh);
  }, [invalidate, route, motionEnabled, size]);
  useFrame((_, delta) => {
    const state = motion.current;
    const active = !state.paused && !state.reduced && !state.hidden && !state.menuOpen;
    if (active) elapsed.current += Math.min(delta, .1);
    const portrait = size.width <= 900;
    const t = state.reduced ? 1 : Math.min(1, elapsed.current / 2);
    const ease = 1 - Math.pow(1 - t, 3);
    if (object.current) {
      object.current.rotation.set(.19, -.35 + Math.sin(elapsed.current * .15) * .055, portrait ? -.55 : -.7);
      object.current.position.set(portrait ? 0 : 1.9, portrait ? -.35 : -.05, 0);
      object.current.scale.setScalar(portrait ? .91 : .85);
      object.current.position.y -= state.scroll * .35;
    }
    vector.set(1.6, 2.9, (portrait ? 16.8 : 14) + (1 - ease) * 1.5);
    camera.position.lerp(vector, state.reduced ? 1 : 1 - Math.exp(-delta * 5));
    look.set(portrait ? 0 : -.8, .15, 0);
    camera.lookAt(look);
    if (camera instanceof PerspectiveCamera && camera.fov !== 35) {
      camera.fov = 35;
      camera.updateProjectionMatrix();
    }
    frames.current++;
    if (frames.current % 20 === 0) {
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.camera = camera.position.toArray().map(n => n.toFixed(3)).join(",");
      gl.domElement.dataset.elapsed = elapsed.current.toFixed(3);
    }
  });
  return <group ref={object}><CableAssembly /></group>;
}

export function ElectricalScene(props: WorldProps) {
  return <Canvas
    dpr={[1, 1.5]}
    camera={{ position: [1.6, 2.9, 15.5], fov: 35, near: .1, far: 70 }}
    frameloop={props.motionEnabled ? "always" : "demand"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    onCreated={({ gl }) => { gl.setClearColor(new Color("#081924"), 0); gl.outputColorSpace = SRGBColorSpace; gl.toneMappingExposure = 1.35; }}>
    <ambientLight intensity={.6} color="#d4eaff" />
    <directionalLight position={[-5, 6, 5]} intensity={4} color="#ffd7ab" />
    <directionalLight position={[5, 2, -3]} intensity={5} color="#8cc9e7" />
    <directionalLight position={[0, 6, 0]} intensity={2.5} color="#fff4df" />
    <Studio onReady={props.onReady} onError={props.onError} />
    <CameraAndModel {...props} />
  </Canvas>;
}
