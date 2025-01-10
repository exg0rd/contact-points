import * as THREE from "three";

export class Triangle {
  constructor(v1, v2, v3) {
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
}

function vectorToString(vector) {
  return `${vector.x} ${vector.y} ${vector.z}`;
}

export function computeNormals(triangles) {
  const normals = new Set();
  const faceIndices = {};

  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    const normal = triangle.getNormal();

    if (!normals[normal]) {
      normals.add(vectorToString(normal));
    }
  }

  const indexedNormals = Array.from(normals);
  console.log(indexedNormals);

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
