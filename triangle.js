import * as THREE from "three";
import { showPolygon } from "./main";

export class Triangle {
  constructor(v1, v2, v3, id) {
    this.id = id;
    this.v1 = new THREE.Vector3().fromArray(v1);
    this.v2 = new THREE.Vector3().fromArray(v2);
    this.v3 = new THREE.Vector3().fromArray(v3);
    this.faceIndex = null;
    this.normal = null;
  }

  getNormal() {
    if (this.normal === null) {
      const v1 = this.v2.clone().sub(this.v1);
      const v2 = this.v3.clone().sub(this.v1);
      const nonRoundedNormal = v1.cross(v2).normalize().toArray();
      for (let i = 0; i < 3; i++) {
        nonRoundedNormal[i] = Number(nonRoundedNormal[i].toFixed(3));
      }

      this.normal = new THREE.Vector3(...nonRoundedNormal);
    }
    return this.normal;
  }

  getPoints() {
    return [this.v1.toArray(), this.v2.toArray(), this.v3.toArray()];
  }

  setFaceIndex(index) {
    this.faceIndex = index;
  }

  BoundingBox() {
    const minMax = (coord) => [
      Math.min(this.v1[coord], this.v2[coord], this.v3[coord]),
      Math.max(this.v1[coord], this.v2[coord], this.v3[coord]),
    ];

    return ["x", "y", "z"].map(minMax);
  }
}

function vectorToString(vector) {
  return `${vector.x} ${vector.y} ${vector.z}`;
}

export function computeNormals(triangles) {
  const normals = new Set();

  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    const normal = triangle.getNormal();

    if (!normals[normal]) {
      normals.add(vectorToString(normal));
    }
  }

  const indexedNormals = Array.from(normals);

  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    const normal = vectorToString(triangle.getNormal());

    const faceIndex = indexedNormals.indexOf(normal);
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

  const originBodyWorldMatrix = new THREE.Matrix4();
  originBodyWorldMatrix.copy(originBody.matrixWorld);

  const trianglesToHighlight = triangles.filter(
    (triangle) => triangle.faceIndex === faceId
  );

  for (let i = 0; i < trianglesToHighlight.length; i++) {
    const triangle = trianglesToHighlight[i];
    const vertices = new Float32Array([
      triangle.v1.x,
      triangle.v1.y,
      triangle.v1.z,
      triangle.v2.x,
      triangle.v2.y,
      triangle.v2.z,
      triangle.v3.x,
      triangle.v3.y,
      triangle.v3.z,
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.applyMatrix4(originBodyWorldMatrix);

    currentFaceGroup.add(mesh);
    scene.add(currentFaceGroup);
  }

  // Ensure the group is added to the scene
  if (!scene.children.includes(currentFaceGroup)) {
    scene.add(currentFaceGroup);
  }
}

const clearFaces = document.getElementById("clearfaces");

clearFaces.addEventListener("click", (e) => {
  faceGroup1.clear();
  faceGroup2.clear();
});

function ifInBoundingRect(triangle, vertice) {
  console.log("BOUNDING CALLED");
  const boundingBox = triangle.BoundingBox();
  return boundingBox.every(
    ([min, max], index) => vertice[index] >= min && vertice[index] <= max
  );
}

function calculateDistance(triangle, vertice) {
  console.log("DISTANSE CALLED");
  const EPSILON = 0.01;

  const a = new THREE.Vector3(vertice.toVector3());
  const b = new THREE.Vector3(triangle.v1);
  const c = new THREE.Vector3(triangle.v2);

  const crossProduct = Math.abs(a.clone().cross(b.clone().sub(a).clone()));
  const V = Math.abs(c.dot(crossProduct)) / 6;
  console.log(V);
  if (Math.abs(V) < EPSILON) return true;
  return false;
}

export function calculatePairs(triangles, vertices) {
  console.log(triangles, vertices, "PAIRS");

  const pairs = [];

  for (let i = 0; i < triangles.length; i++) {
    for (let j = 0; j < vertices.length; j++) {
      if (ifInBoundingRect(triangles[i], vertices[j])) {
        if (calculateDistance(triangles[i], vertices[j])) {
          pairs.push([triangles[i], vertices[j]]);
        }
      }
    }
  }

  console.log(pairs);

  return pairs;
}
