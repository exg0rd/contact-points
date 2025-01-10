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

const gui = new GUI();

// Cube parameters
const Body2 = {
  x: 0,
  y: 0,
  z: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
};

const Body1 = {
  showPolygonWithId: 0,
  polygonsEnabled: false,
};

gui.add(Body2, "x", -11, 11).onChange(updateBodyPosition);
gui.add(Body2, "y", -11, 11).onChange(updateBodyPosition);
gui.add(Body2, "z", -11, 11).onChange(updateBodyPosition);
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
  "models/truss1.stl",
  scene,
  true,
  camera
);

const { wireframe: frame2, coloredMesh: mesh2 } = await loadObject(
  "models/truss2.stl",
  scene,
  false
);

renderVertices(frame2);

const polygons = await getFaceIndices(mesh1);

gui.add(Body1, "showPolygonWithId", 0, polygons.length).onChange(drawTriangle);

let currentTriangle = null;

function drawTriangle() {
  const index = Body1.showPolygonWithId;

  if (index >= 0 && index < polygons.length) {
    const [p1, p2, p3] = polygons[index];
    showPolygon(p1, p2, p3);
  } else {
    console.error(`Invalid index: ${index}`);
  }
}

function showPolygon(p1, p2, p3) {
  if (Body1.showPolygonWithId > polygons.length) return;
  if (currentTriangle) scene.remove(currentTriangle);

  const points = polygons[Body1.showPolygonWithId];

  const geom = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    p1[0],
    p1[1],
    p1[2],
    p2[0],
    p2[1],
    p2[2],
    p3[0],
    p3[1],
    p3[2],
  ]);

  geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  currentTriangle = new THREE.Mesh(geom, material);

  scene.add(currentTriangle);
}

function updateBodyPosition() {
  frame2.position.set(Body2.x, Body2.y, Body2.z);
}

function updateBodyRotation() {
  frame2.rotation.set(Body2.rotateX, Body2.rotateY, Body2.rotateZ);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

//TODO

//HIGHLIGHT ALL POINTS OF SECOND BODY
//FIX CAMERA
//MAYBE WRITE EFFECTIVE SEARCH ALGORIGTHM
//HIGHLIGHT TRIANGLES WITH PAIRS AND MAKE THEM SHOW BY INDEX
