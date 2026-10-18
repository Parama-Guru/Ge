"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import {
  CatmullRomCurve3, CircleGeometry, Curve, Group, InstancedMesh, LatheGeometry, Matrix4, Mesh,
  MeshStandardMaterial, PerspectiveCamera, Quaternion, RingGeometry, TubeGeometry, Vector2, Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { SceneKey } from "@/lib/pages";
import type { WorldState } from "@/lib/world";

const materialSpecs = {
  copper: ["#b8733f", .95, .26],
  steel: ["#9aa9b1", .85, .32],
  darkSteel: ["#36454f", .7, .45],
  porcelain: ["#e8e2d6", 0, .28],
  glass: ["#3f8a84", .1, .12],
  sheath: ["#141e25", .2, .45],
  blue: ["#2f6f9f", .05, .34],
  white: ["#ded7c8", .05, .34],
  grey: ["#59666a", .05, .4],
  enamel: ["#c3cccc", .15, .5],
  panel: ["#1d3a4b", .3, .45],
} as const;

export type Materials = Record<keyof typeof materialSpecs | "signal" | "warm", MeshStandardMaterial>;

export function createMaterials(): Materials {
  const materials = Object.fromEntries(Object.entries(materialSpecs).map(([name, [color, metalness, roughness]]) =>
    [name, new MeshStandardMaterial({ color, metalness, roughness })])) as Omit<Materials, "signal" | "warm">;
  return {
    ...materials,
    signal: new MeshStandardMaterial({ color: "#2a6b45", emissive: "#3ddc84", emissiveIntensity: 1.6, roughness: .4 }),
    warm: new MeshStandardMaterial({ color: "#7a4a22", emissive: "#f2a14a", emissiveIntensity: 1.8, roughness: .4 }),
  };
}

type Fit = { width: number; height: number };
export type SceneProps = { m: Materials; world: RefObject<WorldState>; scene: SceneKey };

export const sceneLayout: Record<SceneKey, { fit: Fit; rotation: [number, number, number] }> = {
  cable: { fit: { width: 7.6, height: 8.2 }, rotation: [.19, -.35, -.7] },
  busbar: { fit: { width: 5.6, height: 4.2 }, rotation: [.32, -.55, 0] },
  insulator: { fit: { width: 5.6, height: 5.4 }, rotation: [.08, -.5, 0] },
  switchgear: { fit: { width: 4.8, height: 5 }, rotation: [.08, -.45, 0] },
  breaker: { fit: { width: 5.2, height: 3 }, rotation: [.22, -.5, 0] },
  network: { fit: { width: 6.2, height: 3.8 }, rotation: [.18, -.3, 0] },
  coil: { fit: { width: 3, height: 2.6 }, rotation: [.35, -.6, .1] },
};

function smooth(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function useProgress(world: RefObject<WorldState>, scene: SceneKey) {
  const last = useRef(.5);
  return () => {
    const state = world.current;
    if (state.scene === scene) last.current = state.progress;
    return last.current;
  };
}

function useDisposable<T extends { dispose: () => void }>(factory: () => T): T {
  const [value] = useMemo(() => [factory()], []);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

export function SceneSlot({ scene, world, children }: { scene: SceneKey; world: RefObject<WorldState>; children: ReactNode }) {
  const group = useRef<Group>(null);
  const presence = useRef(0);
  const placed = useRef(false);
  const anchor = useRef({ x: .5, y: .5, width: .5, height: .6 });
  const backdrop = useRef(false);
  const progress = useProgress(world, scene);
  const { camera, size } = useThree();
  const temp = useMemo(() => ({ direction: new Vector3(), point: new Vector3() }), []);
  const { fit, rotation } = sceneLayout[scene];

  useFrame((_, delta) => {
    const element = group.current;
    if (!element) return;
    const state = world.current;
    const active = state.scene === scene;
    const step = Math.min(delta, .1);
    const live = state.placements[scene];
    const target = active || (live?.visible && !live.backdrop) ? 1 : 0;
    presence.current += (target - presence.current) * (1 - Math.exp(-step * (target ? 5 : 11)));
    if (Math.abs(target - presence.current) < .002) presence.current = target;
    else state.settling = true;
    element.visible = presence.current > .001;
    if (!element.visible) {
      placed.current = false;
      return;
    }
    if (live) {
      Object.assign(anchor.current, { x: live.x, y: live.y, width: live.width, height: live.height });
      backdrop.current = live.backdrop;
    } else if (active) {
      Object.assign(anchor.current, state.anchor);
      backdrop.current = state.backdrop;
    }
    const view = camera as PerspectiveCamera;
    const area = anchor.current;
    temp.direction.set(area.x * 2 - 1, 1 - area.y * 2, .5).unproject(view).sub(view.position).normalize();
    temp.point.copy(view.position).addScaledVector(temp.direction, -view.position.z / temp.direction.z);
    const visibleHeight = 2 * view.position.z * Math.tan(view.fov * Math.PI / 360);
    const visibleWidth = visibleHeight * size.width / size.height;
    const fitted = Math.min(area.width * visibleWidth / fit.width, area.height * visibleHeight / fit.height) * (backdrop.current ? 1 : .86);
    if (!placed.current) {
      element.position.copy(temp.point);
      placed.current = true;
    } else {
      element.position.lerp(temp.point, 1 - Math.exp(-step * 9));
      if (element.position.distanceToSquared(temp.point) > 1e-5) state.settling = true;
    }
    const scale = fitted * (.72 + .28 * smooth(presence.current));
    element.scale.set(state.mirror ? -scale : scale, scale, scale);
    const p = progress();
    element.rotation.set(
      rotation[0] + (p - .5) * .2,
      rotation[1] + state.pose + (p - .5) * .9 + Math.sin(state.time * .25) * .06 + (1 - presence.current) * .5,
      rotation[2],
    );
  });

  return <group ref={group} visible={false}>{children}</group>;
}

export function CableScene({ m }: SceneProps) {
  const parts = useMemo(() => {
    const radius = 1.13;
    const sheath = new LatheGeometry([
      new Vector2(radius, -5.2), new Vector2(radius, 0), new Vector2(radius - .025, .05),
      new Vector2(radius - .11, .025), new Vector2(radius - .14, -.04), new Vector2(radius - .14, -5.2),
    ], 48);
    const ring = new LatheGeometry([
      new Vector2(.91, -.15), new Vector2(.91, .09), new Vector2(1.005, .09), new Vector2(1.015, .045), new Vector2(1.015, -.15),
    ], 48);
    const cores = [
      { x: -.47, z: -.24, dx: -1.14, dz: -.1, end: 3.1, material: m.blue },
      { x: .45, z: -.23, dx: .86, dz: -.33, end: 3.65, material: m.white },
      { x: 0, z: .53, dx: .22, dz: .98, end: 2.65, material: m.grey },
    ].map(core => {
      const center = (t: number) => new Vector3(core.x + core.dx * Math.pow(t, 1.6), -.4 + (core.end + .4) * t, core.z + core.dz * Math.pow(t, 1.7));
      const insulation = new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 14 }, (_, i) => center(i / 13 * .54))), 28, .39, 24, false);
      const face = new RingGeometry(.3, .39, 24);
      const cut = center(.54);
      face.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), center(.55).sub(center(.53)).normalize()));
      face.translate(cut.x, cut.y, cut.z);
      const strands: (TubeGeometry | CircleGeometry)[] = [];
      const offsets: [number, number][] = [[0, 0]];
      for (const [count, r] of [[6, .115], [12, .23]]) {
        for (let n = 0; n < count; n++) offsets.push([Math.cos(n / count * Math.PI * 2) * r, Math.sin(n / count * Math.PI * 2) * r]);
      }
      for (const [x, z] of offsets) {
        const points = Array.from({ length: 20 }, (_, i) => {
          const t = .51 + i / 19 * .49;
          const angle = t * 2.2;
          const point = center(t);
          point.x += x * Math.cos(angle) - z * Math.sin(angle);
          point.z += x * Math.sin(angle) + z * Math.cos(angle);
          return point;
        });
        const curve = new CatmullRomCurve3(points);
        strands.push(new TubeGeometry(curve, 22, .052, 6, false));
        const cap = new CircleGeometry(.052, 6);
        cap.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), curve.getTangent(1)));
        cap.translate(points[19].x, points[19].y, points[19].z);
        strands.push(cap);
      }
      const copper = mergeGeometries(strands);
      strands.forEach(geometry => geometry.dispose());
      if (!copper) throw new Error("Unable to generate conductor geometry.");
      return { insulation, face, copper, material: core.material };
    });
    return { sheath, ring, cores };
  }, [m]);
  useEffect(() => () => {
    parts.sheath.dispose();
    parts.ring.dispose();
    parts.cores.forEach(core => { core.insulation.dispose(); core.face.dispose(); core.copper.dispose(); });
  }, [parts]);

  return <group position={[0, .8, 0]}>
    <mesh geometry={parts.sheath} material={m.sheath} />
    <mesh geometry={parts.ring} material={m.steel} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.09, 0]} material={m.grey}><circleGeometry args={[.98, 32]} /></mesh>
    {parts.cores.map((core, index) => <group key={index}>
      <mesh geometry={core.insulation} material={core.material} />
      <mesh geometry={core.face} material={core.material} />
      <mesh geometry={core.copper} material={m.copper} />
    </group>)}
    {[-4.5, -3.8, -3.1].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.darkSteel}><torusGeometry args={[1.132, .012, 6, 48]} /></mesh>)}
  </group>;
}

function insulatorProfile() {
  const points = [[.1, 0], [.2, 0], [.2, .1], [.34, .18], [.18, .26], [.32, .36], [.17, .44], [.3, .54], [.16, .62], [.16, 1.1], [0, 1.1]];
  return new LatheGeometry(points.map(([x, y]) => new Vector2(x, y)), 20);
}

export function BusbarScene({ m }: SceneProps) {
  const insulator = useDisposable(insulatorProfile);
  const rows = [-.9, 0, .9];
  const columns = [-1.8, 1.8];
  return <group>
    <mesh position={[0, 0, -1.25]} material={m.darkSteel}><boxGeometry args={[5.6, 3.2, .12]} /></mesh>
    {rows.map(y => <mesh key={y} position={[0, y, 0]} material={m.copper}><boxGeometry args={[5.2, .32, .12]} /></mesh>)}
    {columns.flatMap(x => rows.map(y => <group key={`${x}:${y}`}>
      <mesh geometry={insulator} material={m.porcelain} position={[x, y, -1.19]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[x, y, .08]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}><cylinderGeometry args={[.07, .07, .06, 8]} /></mesh>
    </group>))}
  </group>;
}

export function InsulatorScene({ m }: SceneProps) {
  const disc = useDisposable(() => new LatheGeometry([
    [0, .12], [.08, .12], [.1, .06], [.42, .02], [.46, -.02], [.38, -.05], [.3, -.04], [.26, -.08], [.18, -.06], [.12, -.1], [0, -.1],
  ].map(([x, y]) => new Vector2(x, y)), 28));
  const conductor = useDisposable(() => new TubeGeometry(new CatmullRomCurve3(
    Array.from({ length: 9 }, (_, i) => { const x = -2.6 + i * .65; return new Vector3(x, -1.25 + x * x * .035, 0); }),
  ), 48, .06, 8, false));
  const discs = Array.from({ length: 7 }, (_, i) => 1.75 - i * .42);
  return <group>
    <mesh position={[0, 2.2, 0]} material={m.darkSteel}><boxGeometry args={[3.4, .18, .18]} /></mesh>
    <mesh position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 4]} material={m.darkSteel}><boxGeometry args={[.1, .5, .1]} /></mesh>
    <mesh position={[0, 1.08, 0]} material={m.steel}><cylinderGeometry args={[.035, .035, 2.2, 8]} /></mesh>
    {discs.map(y => <mesh key={y} geometry={disc} material={m.glass} position={[0, y, 0]} />)}
    <mesh position={[0, -1.05, 0]} material={m.steel}><boxGeometry args={[.32, .28, .22]} /></mesh>
    <mesh geometry={conductor} material={m.steel} />
  </group>;
}

export function SwitchgearScene({ m, world, scene }: SceneProps) {
  const door = useRef<Group>(null);
  const progress = useProgress(world, scene);
  useFrame(() => {
    if (door.current) door.current.rotation.y = -smooth((progress() - .2) / .55) * 1.25;
  });
  const shell: [number, number, number, number, number, number][] = [
    [0, 0, -.66, 2.4, 3.6, .08], [-1.16, 0, 0, .08, 3.6, 1.4], [1.16, 0, 0, .08, 3.6, 1.4],
    [0, 1.76, 0, 2.4, .08, 1.4], [0, -1.76, 0, 2.4, .08, 1.4],
  ];
  return <group>
    {shell.map(([x, y, z, w, h, d], i) => <mesh key={i} position={[x, y, z]} material={m.enamel}><boxGeometry args={[w, h, d]} /></mesh>)}
    <mesh position={[0, -1.92, 0]} material={m.darkSteel}><boxGeometry args={[2.5, .24, 1.5]} /></mesh>
    <mesh position={[0, 1.88, 0]} material={m.darkSteel}><boxGeometry args={[2.5, .12, 1.5]} /></mesh>
    <mesh position={[0, 0, -.6]} material={m.panel}><boxGeometry args={[2.2, 3.4, .04]} /></mesh>
    {[-.6, 0, .6].map(x => <mesh key={x} position={[x, .1, -.5]} material={m.copper}><boxGeometry args={[.12, 3, .06]} /></mesh>)}
    {[-.6, 0, .6].map(x => <mesh key={`b${x}`} position={[x, -.6, -.3]} material={m.grey}><boxGeometry args={[.46, .6, .4]} /></mesh>)}
    <group ref={door} position={[-1.2, 0, .71]}>
      <mesh position={[1.2, 0, 0]} material={m.enamel}><boxGeometry args={[2.4, 3.5, .06]} /></mesh>
      {[1.1, 1.2, 1.3, 1.4].map(y => <mesh key={y} position={[1.2, y, .04]} material={m.darkSteel}><boxGeometry args={[1.2, .04, .02]} /></mesh>)}
      {[.75, 1.65].map(x => <mesh key={x} position={[x, .35, .05]} rotation={[Math.PI / 2, 0, 0]} material={m.panel}><cylinderGeometry args={[.28, .28, .05, 24]} /></mesh>)}
      {[.75, 1.65].map(x => <mesh key={`n${x}`} position={[x + .06, .4, .085]} rotation={[0, 0, -.7]} material={m.warm}><boxGeometry args={[.025, .2, .01]} /></mesh>)}
      {[.6, 1.2, 1.8].map(x => <mesh key={`l${x}`} position={[x, -.35, .05]} rotation={[Math.PI / 2, 0, 0]} material={m.signal}><cylinderGeometry args={[.06, .06, .04, 12]} /></mesh>)}
      <mesh position={[2.2, -.2, .07]} material={m.steel}><boxGeometry args={[.06, .5, .06]} /></mesh>
    </group>
  </group>;
}

export function BreakerScene({ m, world, scene }: SceneProps) {
  const levers = useRef<(Group | null)[]>([]);
  const lights = useRef<(Mesh | null)[]>([]);
  const progress = useProgress(world, scene);
  const modules = [-1.5, -.5, .5, 1.5];
  useFrame(() => {
    const p = progress();
    modules.forEach((_, i) => {
      const on = smooth(p * 5 - i - .3);
      const lever = levers.current[i];
      if (lever) lever.rotation.x = .55 - on * 1.1;
      const light = lights.current[i];
      if (light) light.material = on > .5 ? m.signal : m.grey;
    });
  });
  return <group>
    <mesh position={[0, 0, -.42]} material={m.steel}><boxGeometry args={[4.8, .35, .08]} /></mesh>
    {[-.2, .2].map(y => <mesh key={y} position={[0, y, -.36]} material={m.steel}><boxGeometry args={[4.8, .04, .12]} /></mesh>)}
    {modules.map((x, i) => <group key={x} position={[x, 0, 0]}>
      <mesh material={m.white}><boxGeometry args={[.86, 1.9, .75]} /></mesh>
      <mesh position={[0, 0, .45]} material={m.white}><boxGeometry args={[.8, .9, .18]} /></mesh>
      <group ref={element => { levers.current[i] = element; }} position={[0, 0, .56]}>
        <mesh position={[0, .2, 0]} material={m.blue}><boxGeometry args={[.2, .42, .16]} /></mesh>
      </group>
      <mesh ref={element => { lights.current[i] = element; }} position={[0, -.32, .55]} material={m.grey}><boxGeometry args={[.22, .08, .02]} /></mesh>
      {[.78, -.78].map(y => <mesh key={y} position={[0, y, .39]} rotation={[Math.PI / 2, 0, 0]} material={m.steel}><cylinderGeometry args={[.09, .09, .04, 10]} /></mesh>)}
    </group>)}
  </group>;
}

const networkNodes: [number, number, number][] = [
  [0, 1.5, 0], [-1.9, .2, .3], [0, .2, -.3], [1.9, .2, .3],
  [-2.8, -1.2, 0], [-1.6, -1.2, .4], [-.5, -1.2, -.2], [.6, -1.2, .3], [1.7, -1.2, -.2], [2.8, -1.2, .2],
];
const networkEdges: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9]];

export function NetworkScene({ m, world }: SceneProps) {
  const nodes = useRef<InstancedMesh>(null);
  const edges = useRef<InstancedMesh>(null);
  const pulses = useRef<InstancedMesh>(null);
  const temp = useMemo(() => ({
    matrix: new Matrix4(), from: new Vector3(), to: new Vector3(), middle: new Vector3(),
    quaternion: new Quaternion(), up: new Vector3(0, 1, 0), scale: new Vector3(), direction: new Vector3(),
  }), []);
  useLayoutEffect(() => {
    const nodeMesh = nodes.current;
    const edgeMesh = edges.current;
    if (!nodeMesh || !edgeMesh) return;
    networkNodes.forEach((point, i) => {
      const r = i === 0 ? .32 : i < 4 ? .24 : .18;
      temp.matrix.compose(temp.from.set(...point), temp.quaternion.identity(), temp.scale.set(r, r, r));
      nodeMesh.setMatrixAt(i, temp.matrix);
    });
    networkEdges.forEach(([a, b], i) => {
      temp.from.set(...networkNodes[a]);
      temp.to.set(...networkNodes[b]);
      temp.direction.copy(temp.to).sub(temp.from);
      temp.quaternion.setFromUnitVectors(temp.up, temp.direction.clone().normalize());
      temp.middle.copy(temp.from).add(temp.to).multiplyScalar(.5);
      temp.matrix.compose(temp.middle, temp.quaternion, temp.scale.set(1, temp.direction.length(), 1));
      edgeMesh.setMatrixAt(i, temp.matrix);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    edgeMesh.instanceMatrix.needsUpdate = true;
  }, [temp]);
  useFrame(() => {
    const pulseMesh = pulses.current;
    if (!pulseMesh) return;
    const time = world.current.time;
    networkEdges.forEach(([a, b], i) => {
      const t = (time * .35 + i * .21) % 1;
      temp.from.set(...networkNodes[a]).lerp(temp.to.set(...networkNodes[b]), t);
      temp.matrix.compose(temp.from, temp.quaternion.identity(), temp.scale.set(.07, .07, .07));
      pulseMesh.setMatrixAt(i, temp.matrix);
    });
    pulseMesh.instanceMatrix.needsUpdate = true;
  });
  return <group>
    <instancedMesh ref={nodes} args={[undefined, m.copper, networkNodes.length]}><sphereGeometry args={[1, 20, 14]} /></instancedMesh>
    <instancedMesh ref={edges} args={[undefined, m.steel, networkEdges.length]}><cylinderGeometry args={[.025, .025, 1, 6]} /></instancedMesh>
    <instancedMesh ref={pulses} args={[undefined, m.warm, networkEdges.length]} frustumCulled={false}><sphereGeometry args={[1, 10, 8]} /></instancedMesh>
  </group>;
}

class Helix extends Curve<Vector3> {
  constructor(private turns: number, private radius: number, private length: number, private phase: number) {
    super();
  }

  getPoint(t: number, target = new Vector3()) {
    const angle = t * this.turns * Math.PI * 2 + this.phase;
    return target.set(-this.length / 2 + t * this.length, Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
  }
}

export function CoilScene({ m, world, scene }: SceneProps) {
  const spool = useRef<Group>(null);
  const progress = useProgress(world, scene);
  const inner = useDisposable(() => new TubeGeometry(new Helix(14, .62, 2, 0), 360, .07, 8, false));
  const outer = useDisposable(() => new TubeGeometry(new Helix(13, .76, 1.9, .9), 330, .07, 8, false));
  useFrame(() => {
    if (spool.current) spool.current.rotation.x = world.current.time * .25 + progress() * 1.5;
  });
  return <group ref={spool}>
    <mesh rotation={[0, 0, Math.PI / 2]} material={m.darkSteel}><cylinderGeometry args={[.5, .5, 2.4, 32]} /></mesh>
    {[-1.15, 1.15].map(x => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.panel}><cylinderGeometry args={[1.05, 1.05, .1, 40]} /></mesh>)}
    <mesh geometry={inner} material={m.copper} />
    <mesh geometry={outer} material={m.copper} />
  </group>;
}

export const sceneComponents: Record<SceneKey, (props: SceneProps) => ReactNode> = {
  cable: CableScene,
  busbar: BusbarScene,
  insulator: InsulatorScene,
  switchgear: SwitchgearScene,
  breaker: BreakerScene,
  network: NetworkScene,
  coil: CoilScene,
};
