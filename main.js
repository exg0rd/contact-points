import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import loadObject from "./load-geometry";
import {
  getFaceIndices,
  getVertices,
  renderVertices,
} from "./geometryManipulation";
import { GUI } from "dat.gui";
import { calculatePairs, computeNormals, highlightFace } from "./triangle";
import { Point } from "./geometryManipulation";

const gui = new GUI();

// Cube parameters
const Body2 = {
  x: 1,
  y: 12.5,
  z: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
};

const Body1 = {
  showPolygonWithId: 0,
  polygonsEnabled: false,
};

gui.add(Body2, "x", -100, 100).onChange(updateBodyPosition);
gui.add(Body2, "y", -100, 100).onChange(updateBodyPosition);
gui.add(Body2, "z", -100, 100).onChange(updateBodyPosition);
gui
  .add(Body2, "rotateX", -Math.PI / 2, Math.PI / 2)
  .onChange(updateBodyRotation);
gui
  .add(Body2, "rotateY", -Math.PI / 2, Math.PI / 2)
  .onChange(updateBodyRotation);
gui
  .add(Body2, "rotateZ", -Math.PI / 2, Math.PI / 2)
  .onChange(updateBodyRotation);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(20, 20, 20);

const bgLoader = new THREE.TextureLoader();

const scene = new THREE.Scene();

scene.background = bgLoader.load("textures/bg.png");

const controls = new OrbitControls(camera, renderer.domElement);
const loader = new GLTFLoader();

const light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(0, 0, 0);
scene.add(light);

const { wireframe: frame1, coloredMesh: mesh1 } = await loadObject(
  "models/test.stl",
  scene,
  true,
  camera
);

const { wireframe: frame2, coloredMesh: mesh2 } = await loadObject(
  "models/test.stl",
  scene,
  false
);

renderVertices(frame2);

let polygons1 = await getFaceIndices(mesh1);

let triangles1 = computeNormals(polygons1);

let polygons2 = await getFaceIndices(mesh2);

let triangles2 = computeNormals(polygons2);

gui.add(Body1, "showPolygonWithId", 0, polygons1.length).onChange(drawTriangle);

let currentTriangle = null;

function drawTriangle(triangle) {
  showPolygon(triangle.v1, triangle.v2, triangle.v3);
}

export function showPolygon(p1, p2, p3) {
  if (currentTriangle) scene.remove(currentTriangle);

  const geom = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    p1.x,
    p1.y,
    p1.z,
    p2.x,
    p2.y,
    p2.z,
    p3.x,
    p3.y,
    p3.z,
  ]);

  geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  currentTriangle = new THREE.Mesh(geom, material);

  scene.add(currentTriangle);
}

async function updateBodyPosition() {
  frame2.position.set(Body2.x, Body2.y, Body2.z);
  mesh2.position.set(Body2.x, Body2.y, Body2.z);

  frame2.position.needsUpdate = true;
  mesh2.position.needsUpdate = true;

  polygons2 = await getFaceIndices(mesh2);
  triangles2 = computeNormals(polygons2);
}

async function updateBodyRotation() {
  frame2.rotation.set(Body2.rotateX, Body2.rotateY, Body2.rotateZ);
  mesh2.rotation.set(Body2.rotateX, Body2.rotateY, Body2.rotateZ);

  frame2.position.needsUpdate = true;
  mesh2.position.needsUpdate = true;

  polygons2 = await getFaceIndices(mesh2);
  triangles2 = computeNormals(polygons2);
}

const faceInput1 = document.getElementById("faceInput1");

const faceInput2 = document.getElementById("faceInput2");

faceInput1.addEventListener("input", () => {
  highlightFace(1, triangles1, Number(faceInput1.value), scene, mesh1);
});

faceInput2.addEventListener("input", () => {
  highlightFace(2, triangles2, Number(faceInput2.value), scene, mesh2);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function renderPairs(pairs) {
  console.log(pairs);
  for (let i = 0; i <= pairs.length; i += 2) {
    drawTriangle(pairs[i]);
    drawVertice[pairs[i + 1]];
  }
}

const calcPairsButton = document.getElementById("calcpairs");

calcPairsButton.addEventListener("click", () => {
  const body1Triangles = triangles1.filter(
    (triangle) => triangle.faceIndex === Number(faceInput1.value)
  );

  const body2Triangles = triangles2.filter(
    (triangle) => triangle.faceIndex === Number(faceInput2.value)
  );

  console.log("FACE BODY 2 TRIANGLES", body2Triangles);

  const vertices = [];

  const idMap = new Map();

  for (let i = 0; i < body2Triangles.length; i++) {
    console.log(body2Triangles[i].getPoints(), body2Triangles[i].id);
    for (const point of body2Triangles[i].getPoints()) {
      const newPoint = new Point(
        point[0],
        point[1],
        point[2],
        body2Triangles[i].id
      );
      console.log("NEW POINT", newPoint);
      if (!idMap.has(newPoint.id)) {
        idMap.set(newPoint.id, String(newPoint.id));
        vertices.push(newPoint);
      }
    }
  }
  console.log(idMap);
  console.log(vertices);

  const pairs = calculatePairs(body1Triangles, vertices);
  renderPairs(pairs);
});

animate();

//TODO
//для каждого треугольника грани тела 1 рассмотреть каждую точку которая находится в его bounding rect, посчитать расстояние
// между ней и плоскостью треугольника через объем пирамиды, если он меньше эпсилона, составить пару треугольник - точка
// готовыми функциями нарисовать
