import * as THREE from "three";
import { showPolygon } from "./main";

export class Triangle {
  constructor(triangle, id) {
    this.id = id;
    this.triangle = triangle;
    this.faceIndex = null;
    this.normal = null;
  }

  getNormal() {
    return this.triangle.normal;
  }

  getPoints() {
    return [
      this.triangle.a.toArray(),
      this.triangle.b.toArray(),
      this.triangle.c.toArray(),
    ];
  }

  setFaceIndex(index) {
    this.faceIndex = index;
  }

  getTriangle() {
    return this.triangle;
  }

  getMidPoint() {
    let point = new THREE.Vector3();
    this.triangle.getMidpoint(point);
    return point;
  }
}

function vectorToString(vector) {
  return `${Math.round(vector.x, 3)} ${Math.round(vector.y, 3)} ${Math.round(
    vector.z,
    3
  )}`;
}

export function computeNormals(triangles) {
  const normals = new Set();

  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    let normal = new THREE.Vector3();
    triangle.triangle.getNormal(normal);
    const normalToString = vectorToString(normal);

    if (!normals[normalToString]) {
      normals.add(normalToString);
    }
  }

  const indexedNormals = Array.from(normals);

  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    let normal = new THREE.Vector3();
    triangle.triangle.getNormal(normal);
    const normalToString = vectorToString(normal);

    const faceIndex = indexedNormals.indexOf(normalToString);
    if (faceIndex !== -1) {
      triangle.setFaceIndex(faceIndex);
    }
  }

  return triangles;
}

let faceGroup1 = new THREE.Group();
let faceGroup2 = new THREE.Group();

export function highlightFace(bodyId, triangles, faceId, scene, originBody) {
  if (triangles[triangles.length - 1].faceId < faceId) return;

  const currentFaceGroup = bodyId === 1 ? faceGroup1 : faceGroup2;
  currentFaceGroup.clear();

  const trianglesToHighlight = triangles.filter(
    (triangle) => triangle.faceIndex === faceId
  );

  for (let i = 0; i < trianglesToHighlight.length; i++) {
    const triangle = trianglesToHighlight[i].triangle;

    const positions = [
      triangle.a.toArray(),
      triangle.b.toArray(),
      triangle.c.toArray(),
    ];

    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array(positions.flat());

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const mesh = new THREE.Mesh(geometry, material);

    currentFaceGroup.add(mesh);
    scene.add(currentFaceGroup);
  }

  if (!scene.children.includes(currentFaceGroup)) {
    scene.add(currentFaceGroup);
  }
}

const clearFaces = document.getElementById("clearfaces");

clearFaces.addEventListener("click", (e) => {
  faceGroup1.clear();
  faceGroup2.clear();
});

export function calculatePairs(triangles, vertices) {
  const pairs = [];

  for (let i = 0; i < triangles.length; i++) {
    for (let j = 0; j < vertices.length; j++) {
      if (triangles[i].triangle.containsPoint(vertices[j])) {
        pairs.push([triangles[i], vertices[j]]);
      }
    }
  }

  return pairs;
}
