"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending, BoxGeometry, CanvasTexture, CatmullRomCurve3, Color, CylinderGeometry,
  ExtrudeGeometry, Group, InstancedMesh, Matrix4, PerspectiveCamera, Points,
  PCFShadowMap, Quaternion, RepeatWrapping, Shape, SRGBColorSpace, Vector3,
} from "three";
import { cameraView, type WorldProps } from "@/lib/world";
import { buildIndustrialEnvironment, type WorldBatch } from "@/lib/world-geometry";

function Buildings() {
  const batches = useMemo(buildIndustrialEnvironment, []);
  const geometries = useMemo(() => {
    const wedge = new Shape();
    wedge.moveTo(-.5, 0);
    wedge.lineTo(.5, 0);
    wedge.lineTo(.5, 1);
    wedge.lineTo(-.5, 0);
    const roof = new ExtrudeGeometry(wedge, { depth: 1, bevelEnabled: false });
    roof.translate(0, 0, -.5);
    return { box: new BoxGeometry(1, 1, 1), cylinder: new CylinderGeometry(.5, .5, 1, 10), wedge: roof };
  }, []);
  useEffect(() => () => { Object.values(geometries).forEach(geometry => geometry.dispose()); }, [geometries]);
  return <group>{batches.map((batch, index) => <Batch key={index} batch={batch} geometry={geometries[batch.shape]} />)}</group>;
}

function Batch({ batch, geometry }: { batch: WorldBatch; geometry: BoxGeometry | CylinderGeometry | ExtrudeGeometry }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const matrix = new Matrix4();
    batch.parts.forEach((part, index) => {
      matrix.compose(new Vector3(...part.position), new Quaternion(...part.rotation), new Vector3(...part.size));
      ref.current!.setMatrixAt(index, matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [batch]);
  return <instancedMesh ref={ref} args={[geometry, undefined, batch.parts.length]} castShadow={!batch.luminous} receiveShadow>
    <meshStandardMaterial color={batch.color} roughness={.62} metalness={.4} emissive={batch.luminous ? batch.color : "#000000"} emissiveIntensity={batch.luminous ? 3.2 : 0} />
  </instancedMesh>;
}

function Ground() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Cannot create the procedural ground texture.");
    const image = context.createImageData(256, 256);
    for (let i = 0; i < image.data.length; i += 4) {
      const noise = Math.sin(i * 12.9898) * 43758.5453;
      const value = 65 + (noise - Math.floor(noise)) * 18;
      image.data[i] = value * .77;
      image.data[i + 1] = value * .9;
      image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    const result = new CanvasTexture(canvas);
    result.wrapS = result.wrapT = RepeatWrapping;
    result.repeat.set(38, 38);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.16, 0]} receiveShadow><planeGeometry args={[250, 250]} /><meshStandardMaterial map={texture} roughness={.9} metalness={.18} /></mesh>;
}

function PowerPaths({ motion }: Pick<WorldProps, "motion">) {
  const packets = useRef<InstancedMesh>(null);
  const time = useRef(0);
  const curves = useMemo(() => [
    [[-10, .17, 1], [-10, .17, 4], [-5, .17, 4], [0, .17, 6.1], [6, .17, 6.1], [7, .17, .1]],
    [[-4.5, .2, -4], [-.5, .2, -4], [-.5, .2, 2.8], [4, .2, 2.8], [8, .2, 2.8], [8, .2, -.5]],
    [[-20, 14.1, -18], [-15, 10.2, -10], [-10, 11.7, -3], [-7, 6, -1], [-4.5, 3.85, 1]],
  ].map(points => new CatmullRomCurve3(points.map(point => new Vector3(...point)), false, "catmullrom", .16)), []);
  const matrix = useMemo(() => new Matrix4(), []);
  const position = useMemo(() => new Vector3(), []);
  useFrame((_, delta) => {
    const state = motion.current;
    if (!state.paused && !state.reduced && !state.hidden && !state.menuOpen) time.current += Math.min(delta, .08);
    const mesh = packets.current;
    if (!mesh) return;
    curves.forEach((curve, pathIndex) => {
      for (let i = 0; i < 12; i++) {
        curve.getPoint((time.current * .035 + i / 12 + pathIndex * .08) % 1, position);
        matrix.makeTranslation(position.x, position.y, position.z);
        mesh.setMatrixAt(pathIndex * 12 + i, matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <group>
    {curves.map((curve, index) => <mesh key={index}><tubeGeometry args={[curve, 80, index === 2 ? .022 : .025, 6, false]} /><meshStandardMaterial color="#b58745" emissive="#e09239" emissiveIntensity={1.3} roughness={.5} /></mesh>)}
    <instancedMesh ref={packets} args={[undefined, undefined, 36]} frustumCulled={false}><sphereGeometry args={[.074, 8, 6]} /><meshBasicMaterial color={[4.5, 2.6, .8]} toneMapped={false} /></instancedMesh>
    {[-2.7, 2.7].map(offset => <mesh key={offset}><tubeGeometry args={[new CatmullRomCurve3([
      new Vector3(-20 + offset, 14.1, -18), new Vector3(-15 + offset, 9.8, -10), new Vector3(-10 + offset, 11.7, -3),
    ]), 45, .026, 5, false]} /><meshStandardMaterial color="#688794" metalness={.5} roughness={.7} /></mesh>)}
  </group>;
}

function Atmosphere({ motion }: Pick<WorldProps, "motion">) {
  const dust = useRef<Points>(null);
  const points = useMemo(() => {
    const array = new Float32Array(220 * 3);
    for (let i = 0; i < 220; i++) {
      array[i * 3] = Math.sin(i * 127.1) * 42;
      array[i * 3 + 1] = 1 + (Math.sin(i * 37.7) + 1) * 11;
      array[i * 3 + 2] = Math.cos(i * 269.5) * 38;
    }
    return array;
  }, []);
  useFrame((_, delta) => {
    const state = motion.current;
    if (dust.current && !state.paused && !state.reduced && !state.hidden && !state.menuOpen) dust.current.rotation.y += delta * .006;
  });
  return <points ref={dust}><bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><pointsMaterial color="#b7c7cc" size={.045} transparent opacity={.38} depthWrite={false} blending={AdditiveBlending} /></points>;
}

function Ventilation({ motion }: Pick<WorldProps, "motion">) {
  const rotors = useRef<Group>(null);
  useFrame((_, delta) => {
    const state = motion.current;
    if (rotors.current && !state.paused && !state.reduced && !state.hidden && !state.menuOpen) rotors.current.rotation.y += delta * .9;
  });
  return <group position={[8, 6.55, -5]}>
    <mesh castShadow><cylinderGeometry args={[1.02, 1.02, .65, 24]} /><meshStandardMaterial color="#466879" roughness={.7} metalness={.5} /></mesh>
    <mesh position={[0, .36, 0]}><torusGeometry args={[.87, .045, 6, 30]} /><meshStandardMaterial color="#b6cbd2" /></mesh>
    <group ref={rotors} position={[0, .35, 0]}>{[0, Math.PI / 3, Math.PI * 2 / 3].map(angle => <mesh key={angle} rotation={[0, angle, 0]}><boxGeometry args={[1.65, .025, .17]} /><meshStandardMaterial color="#8babb8" metalness={.5} roughness={.45} /></mesh>)}</group>
  </group>;
}

function CameraDirection(props: WorldProps) {
  const { camera, gl, size, invalidate } = useThree();
  const lastMetrics = useRef(0);
  const vectors = useMemo(() => ({
    position: new Vector3(), target: new Vector3(), look: new Vector3(0, 3, -2),
  }), []);

  useEffect(() => {
    const refresh = () => invalidate();
    window.addEventListener("world-control", refresh);
    const contextLost = (event: Event) => {
      event.preventDefault();
      props.onError("The 3D background stopped. All company information remains available.");
    };
    gl.domElement.addEventListener("webglcontextlost", contextLost);
    let cancelled = false;
    let second = 0;
    const first = requestAnimationFrame(() => {
      invalidate();
      second = requestAnimationFrame(() => { if (!cancelled) props.onReady(); });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      window.removeEventListener("world-control", refresh);
      gl.domElement.removeEventListener("webglcontextlost", contextLost);
    };
  }, [camera, gl, invalidate, props.onError, props.onReady]);

  useEffect(() => {
    invalidate();
  }, [props.route, props.motionEnabled, size, invalidate]);

  useFrame(() => { gl.info.reset(); }, -100);
  useFrame((_, delta) => {
    const state = props.motion.current;
    const active = !state.paused && !state.reduced && !state.hidden && !state.menuOpen;
    const portrait = size.width / size.height < .9;
    const view = cameraView(props.route);
    vectors.position.set(...view.position);
    vectors.target.set(...view.target);
    if (portrait) {
      vectors.position.sub(vectors.target).multiplyScalar(1.6).add(vectors.target);
      vectors.target.y += props.route === "/" || props.route === "/index.html" ? 3.1 : .8;
    }
    if (camera instanceof PerspectiveCamera) {
      const fov = portrait ? 46 : size.width / size.height > 2 ? 40 : 44;
      if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    }
    const amount = active ? 1 - Math.exp(-Math.min(delta, .1) * 3.2) : 1;
    camera.position.lerp(vectors.position, amount);
    vectors.look.lerp(vectors.target, amount);
    camera.lookAt(vectors.look);
    lastMetrics.current += delta;
    if (lastMetrics.current > .8) {
      lastMetrics.current = 0;
      requestAnimationFrame(() => {
        gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
        gl.domElement.dataset.triangles = String(gl.info.render.triangles);
        gl.domElement.dataset.camera = camera.position.toArray().map(n => n.toFixed(2)).join(",");
      });
    }
  });
  return null;
}

export function IndustrialWorld(props: WorldProps) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = matchMedia("(max-width: 800px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return <Canvas
    shadows={{ type: PCFShadowMap }} dpr={mobile ? 1 : [1, 1.35]}
    camera={{ position: [32, 16, 34], fov: 44, near: .2, far: 220 }}
    frameloop={props.motionEnabled ? "always" : "demand"}
    gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
    onCreated={({ gl }) => {
      gl.setClearColor(new Color("#091820"));
      gl.toneMappingExposure = 1.05;
      gl.info.autoReset = false;
    }}
  >
    <fog attach="fog" args={["#091820", 38, 135]} />
    <ambientLight intensity={.48} color="#91b9d1" />
    <hemisphereLight args={["#a2c9e7", "#344349", .85]} />
    <directionalLight position={[-15, 25, 18]} color="#ffd5a0" intensity={4} castShadow shadow-mapSize-width={mobile ? 1024 : 2048} shadow-mapSize-height={mobile ? 1024 : 2048} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-.0003} shadow-normalBias={.06} />
    <directionalLight position={[12, 15, -25]} color="#5cadd7" intensity={3} />
    <pointLight position={[-5, 3, 7]} color="#ffb456" intensity={18} distance={14} decay={2} />
    <pointLight position={[13, 5, 7]} color="#ffce7c" intensity={18} distance={16} decay={2} />
    <Ground />
    <Buildings />
    <PowerPaths motion={props.motion} />
    <Atmosphere motion={props.motion} />
    <Ventilation motion={props.motion} />
    <CameraDirection {...props} />
    <EffectComposer multisampling={mobile ? 0 : 2} enableNormalPass={false} resolutionScale={mobile ? .65 : .85}>
      <Bloom intensity={mobile ? .5 : .7} luminanceThreshold={1.05} luminanceSmoothing={.55} mipmapBlur />
    </EffectComposer>
  </Canvas>;
}
