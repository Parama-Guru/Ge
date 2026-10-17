import { Euler, Quaternion, Vector3 } from "three";
import type { Vector } from "./world";

export type Solid = "box" | "cylinder" | "wedge";
export type WorldPart = {
  position: Vector;
  size: Vector;
  rotation: [number, number, number, number];
};
export type WorldBatch = { shape: Solid; color: string; luminous: boolean; parts: WorldPart[] };

export function buildIndustrialEnvironment(): WorldBatch[] {
  const batches = new Map<string, WorldBatch>();
  const add = (shape: Solid, color: string, position: Vector, size: Vector, angles?: Vector, luminous = false) => {
    const key = `${shape}:${color}:${luminous}`;
    if (!batches.has(key)) batches.set(key, { shape, color, luminous, parts: [] });
    const q = angles ? new Quaternion().setFromEuler(new Euler(...angles)) : new Quaternion();
    batches.get(key)!.parts.push({ position, size, rotation: [q.x, q.y, q.z, q.w] });
  };
  const box = (color: string, position: Vector, size: Vector, angles?: Vector, luminous = false) => add("box", color, position, size, angles, luminous);
  const cylinder = (color: string, position: Vector, size: Vector, angles?: Vector, luminous = false) => add("cylinder", color, position, size, angles, luminous);
  const beam = (a: Vector, b: Vector, width: number, color: string, round = false) => {
    const start = new Vector3(...a), end = new Vector3(...b);
    const direction = end.clone().sub(start);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
    const middle = start.add(end).multiplyScalar(.5);
    const shape = round ? "cylinder" : "box";
    const key = `${shape}:${color}:false`;
    if (!batches.has(key)) batches.set(key, { shape, color, luminous: false, parts: [] });
    batches.get(key)!.parts.push({ position: [middle.x, middle.y, middle.z], size: [width, direction.length(), width], rotation: [q.x, q.y, q.z, q.w] });
  };
  const metal = "#8eafb9", darkSteel = "#314e5c", wall = "#486776", concrete = "#748386", trim = "#a1bac0", glow = "#ffbe65";

  box("#253942", [0, -.08, -2], [43, .12, 34]);
  box("#12242d", [1, .008, 11], [47, .025, 5]);
  box("#12242d", [-20, .008, -6], [4.5, .025, 32]);
  for (let x = -22; x < 25; x += 2.5) box("#91a1a1", [x, .028, 11], [1.15, .013, .08]);
  for (let z = -20; z < 10; z += 2.5) box("#91a1a1", [-20, .028, z], [.08, .013, 1.1]);
  for (let x = -16; x < 20; x += 4) {
    box("#b8a67b", [x, .024, 8.65], [1.9, .01, .045]);
    box("#8b9fa4", [x, .025, -17.7], [3.4, .016, .11]);
  }

  function pylon(x: number, z: number, height: number) {
    const levels = [0, .18, .36, .54, .72, .88, 1].map(level => height * level);
    for (let level = 0; level < levels.length - 1; level++) {
      const y1 = levels[level], y2 = levels[level + 1];
      const r1 = 1.6 - y1 / height * 1.3, r2 = 1.6 - y2 / height * 1.3;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        beam([x + sx * r1, y1, z + sz * r1], [x + sx * r2, y2, z + sz * r2], .1, metal);
        beam([x + sx * r1, y1, z + sz * r1], [x - sx * r2, y2, z + sz * r2], .045, metal);
        beam([x + sx * r1, y1, z + sz * r1], [x + sx * r2, y2, z - sz * r2], .045, metal);
        beam([x + sx * r1, y1, z + sz * r1], [x - sx * r1, y1, z + sz * r1], .055, darkSteel);
      }
    }
    for (const [fraction, width] of [[.65, 6.7], [.82, 5.8], [.98, 4.6]]) {
      const y = height * fraction;
      beam([x - width / 2, y, z], [x + width / 2, y, z], .13, metal);
      beam([x - width / 2, y, z], [x, y + 1.15, z], .075, metal);
      beam([x + width / 2, y, z], [x, y + 1.15, z], .075, metal);
      for (const side of [-1, 1]) {
        const ix = x + side * width * .43;
        cylinder("#557786", [ix, y - .48, z], [.14, .9, .14]);
        for (let iy = y - .87; iy < y - .1; iy += .13) cylinder("#b3c7cc", [ix, iy, z], [.39, .05, .39]);
      }
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(concrete, [x + sx * 1.6, .08, z + sz * 1.6], [.8, .16, .8]);
  }
  pylon(-10, -3, 13);
  pylon(-20, -18, 15.5);
  pylon(19, -29, 17);

  function transformer(x: number, z: number) {
    box(concrete, [x, .18, z], [5.2, .35, 4.2]);
    box("#62838c", [x, 1.38, z], [3.45, 2.2, 2.5]);
    box(trim, [x, 2.58, z], [3.6, .21, 2.68]);
    for (let fx = x - 1.8; fx <= x + 1.8; fx += .23) {
      box(darkSteel, [fx, 1.37, z + 1.52], [.055, 1.85, .6]);
      box(darkSteel, [fx, 1.37, z - 1.52], [.055, 1.85, .6]);
      box("#83a0aa", [fx, 2.22, z + 1.52], [.065, .045, .64]);
    }
    cylinder("#839eaa", [x, 2.95, z - 1.05], [.8, 3.1, .8], [0, 0, Math.PI / 2]);
    for (let ix = x - 1.1; ix <= x + 1.1; ix += 1.1) {
      cylinder("#456778", [ix, 3.18, z + .3], [.13, 1.12, .13]);
      for (let iy = 2.76; iy <= 3.57; iy += .11) cylinder("#c4d1d2", [ix, iy, z + .3], [.37 - (iy - 2.7) * .09, .04, .37 - (iy - 2.7) * .09]);
      cylinder(metal, [ix, 3.82, z + .3], [.17, .3, .17]);
    }
    for (const side of [-1, 1]) {
      cylinder("#456573", [x + side * 1.85, 1.9, z], [.14, 2, .14]);
      beam([x + side * 1.85, .9, z], [x + side * 1.2, .9, z], .14, metal, true);
    }
    box("#b2c2c5", [x - .2, 1.25, z + 1.28], [.8, .6, .06]);
    box("#182f3d", [x - .2, 1.25, z + 1.32], [.58, .34, .03]);
  }
  transformer(-4.5, .8);
  transformer(-4.5, -6.2);

  for (let x = -8; x <= -.5; x += 2.5) {
    box(concrete, [x, .1, -11], [1.6, .2, 2]);
    cylinder(metal, [x, 1.6, -11], [.13, 3, .13]);
    for (let y = 2; y < 3.4; y += .18) cylinder("#aac1c7", [x, y, -11], [.45, .055, .45]);
    cylinder(darkSteel, [x, 3.7, -11], [.26, .9, .26]);
    beam([x, 4.05, -11], [x, 4.05, -7.6], .18, metal, true);
  }
  beam([-8, 4.05, -11], [1, 4.05, -11], .22, metal, true);

  for (let x = -2; x <= 4.6; x += 1.05) {
    box("#244e64", [x, 1.43, 5], [.98, 2.7, 1]);
    box("#aac0c8", [x, 2.85, 5], [1.02, .16, 1.08]);
    box("#7299ab", [x, 1.9, 5.52], [.69, .72, .035]);
    box("#092938", [x, 1.99, 5.55], [.42, .35, .025]);
    box("#344d56", [x + .32, 1.2, 5.55], [.06, .31, .04]);
    cylinder("#d0e0dc", [x - .16, 1.24, 5.55], [.1, .04, .1], [Math.PI / 2, 0, 0]);
    cylinder(glow, [x + .03, 1.24, 5.55], [.06, .045, .06], [Math.PI / 2, 0, 0], true);
    for (let y = .35; y < .85; y += .1) box("#183b4d", [x, y, 5.54], [.63, .035, .03]);
  }
  box(concrete, [1.1, .055, 5], [8.2, .1, 1.55]);

  function factory(x: number, z: number, width: number, depth: number, height: number) {
    box(wall, [x, height / 2, z], [width, height, depth]);
    box("#213e4e", [x, .25, z], [width + .12, .5, depth + .12]);
    const sections = 4;
    const sectionWidth = width / sections;
    for (let i = 0; i < sections; i++) {
      const rx = x - width / 2 + sectionWidth * (i + .5);
      add("wedge", "#7895a0", [rx, height, z], [sectionWidth, 1.4, depth]);
      box("#a4c7ce", [rx + sectionWidth / 2 + .02, height + .72, z], [.035, 1.28, depth - .16]);
      box(trim, [rx + sectionWidth / 2 + .035, height + 1.39, z], [.065, .065, depth]);
      box("#293e46", [rx + sectionWidth / 2 + .04, height + .73, z], [.02, .04, depth]);
    }
    for (let fx = x - width / 2 + .3; fx < x + width / 2; fx += .55) {
      box("#66818d", [fx, height / 2, z + depth / 2 + .018], [.035, height - .1, .032]);
      box("#4a6470", [fx, height / 2, z - depth / 2 - .018], [.035, height - .1, .032]);
    }
    box("#a3b9bd", [x, 3.15, z + depth / 2 + .06], [width - 1, 1.23, .08]);
    box("#183c4c", [x, 3.15, z + depth / 2 + .11], [width - 1.15, 1.03, .055]);
    for (let wx = x - width / 2 + .8; wx <= x + width / 2 - .5; wx += .83) box("#8caab6", [wx, 3.15, z + depth / 2 + .15], [.055, 1.03, .035]);
    for (let dz = z - depth / 2 + 1; dz < z + depth / 2; dz += 1.2) {
      box("#a8b7b7", [x + width / 2 + .02, 3.15, dz], [.07, 1.2, .94]);
      box("#1a3d4d", [x + width / 2 + .065, 3.15, dz], [.025, 1.01, .76]);
    }
    for (let door = 0; door < 2; door++) {
      const dx = x - width / 2 + 2.1 + door * 3.3;
      box("#9eb0b6", [dx, 1.35, z + depth / 2 + .1], [2.55, 2.65, .17]);
      box("#476571", [dx, 1.35, z + depth / 2 + .2], [2.32, 2.49, .035]);
      for (let y = .25; y < 2.6; y += .21) box("#73909d", [dx, y, z + depth / 2 + .225], [2.3, .024, .02]);
    }
    box(glow, [x, 4.85, z + depth / 2 + .21], [width - .5, .045, .03], undefined, true);
    box("#0b2636", [x, 4.85, z + depth / 2 + .27], [width - .4, .18, .15]);
    for (let tx = x - width / 2; tx <= x + width / 2; tx += 4) {
      beam([tx, .1, z + depth / 2 + .22], [tx, height + .08, z + depth / 2 + .22], .14, metal);
    }
  }
  factory(8, -5.7, 15, 10, 5);
  factory(11, -21.8, 14, 8, 4.4);
  box("#6a8793", [13, 2, 4.15], [4, 4, 5.7]);
  box("#bfd0d2", [13, 4.1, 4.15], [4.3, .22, 6]);
  box("#152f3a", [13, 2.5, 7.03], [3.4, 1.9, .04]);
  for (let x = 11.5; x < 14.8; x += .7) box("#a1bbc7", [x, 2.5, 7.07], [.045, 1.9, .02]);
  box(glow, [13, 1.64, 7.08], [3.5, .025, .025], undefined, true);

  for (const [x, z] of [[-15, 8], [-6, 9], [7, 9], [19, 8], [18, -13]]) {
    cylinder("#8299a5", [x, 3.05, z], [.095, 6, .095]);
    beam([x, 6, z], [x + .75, 6.35, z], .075, metal, true);
    box("#617d8b", [x + .85, 6.32, z], [.8, .1, .36]);
    box("#ffdf99", [x + .85, 6.26, z], [.64, .025, .27], undefined, true);
    box(concrete, [x, .08, z], [.5, .15, .5]);
  }
  for (let x = -17; x <= 21; x += 2) {
    cylinder(darkSteel, [x, 1, -17.8], [.045, 2, .045]);
    beam([x, 1.8, -17.8], [x + 1.8, .3, -17.8], .02, "#42606e");
  }
  beam([-17, 1.85, -17.8], [21, 1.85, -17.8], .04, metal);
  for (let x = -42; x < 50; x += 12) {
    const height = 3 + Math.abs(Math.sin(x * 1.3)) * 4;
    box("#203d4a", [x, height / 2, -42], [9, height, 10]);
    for (let wx = x - 3; wx < x + 4; wx += 1.4) box("#43697a", [wx, height * .65, -36.96], [.5, .65, .025]);
  }
  for (const [x, z] of [[-15, -11], [18, -12], [19, -6]]) {
    cylinder("#72909b", [x, 1.4, z], [2, 2.8, 2]);
    cylinder("#b4c4c6", [x, 2.85, z], [2.1, .16, 2.1]);
    cylinder("#365967", [x, 1.4, z], [2.03, .09, 2.03]);
    cylinder(darkSteel, [x, 3.25, z], [.1, .7, .1]);
  }
  return [...batches.values()];
}
