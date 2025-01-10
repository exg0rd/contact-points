import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import loadObject from "./load-geometry";
import { getVertices } from "./geometryManipulation";
import { GUI } from "dat.gui";

const gui = new GUI();

// Cube parameters
const Body2 = {
  x: 0,
  y: 0,
  z: 0,
};

gui.add(Body2, "x", -10, 10).onChange(updateBodyPosition);
gui.add(Body2, "y", -10, 10).onChange(updateBodyPosition);
gui.add(Body2, "z", -10, 10).onChange(updateBodyPosition);

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
  "models/bebe.stl",
  scene,
  true,
  camera
);

const { wireframe: frame2, coloredMesh: mesh2 } = await loadObject(
  "models/bebe.stl",
  scene,
  false
);

frame1.position.set(0, 0, 0);
mesh1.position.set(0, 0, 0);

console.log(frame1, mesh1);
console.log(frame2, mesh2);

function updateBodyPosition() {
  frame2.position.set(Body2.x, Body2.y, Body2.z);
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
