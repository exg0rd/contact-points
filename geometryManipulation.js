import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { Triangle } from "./triangle";

export class Point {
  constructor(x, y, z, id) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  toVector3() {
    return new THREE.Vector3(this.x, this.y, this.z);
  }

  toString() {
    return `${this.x},${this.y},${this.z}`;
  }
}

let ROUND_DECIMALS = 5;

export const getVertices = (geometry) => {
  const positionAttribute = geometry.getAttribute("position");
  let objectVertices = [];
  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);
    objectVertices.push(
      new Point(
        x.toFixed(ROUND_DECIMALS),
        y.toFixed(ROUND_DECIMALS),
        z.toFixed(ROUND_DECIMALS),
        undefined
      )
    );
  }

  return objectVertices;
};

export const renderVertices = (mesh) => {
  const scene = mesh.parent;
  const group = new THREE.Group();

  const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: "RED" });

  const geom = mesh.geometry;

  const verticesArray = getVertices(geom);

  for (const point of verticesArray) {
    const vertexSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    vertexSphere.position.copy(point.toVector3());
    group.add(vertexSphere);
  }

  scene.add(group);
  mesh.add(group);
};

export const renderVertice = (vertice) => {
  const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: "BLUE" });
  const vertexSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  vertexSphere.position.copy(vertice.toVector3());
  scene.add(vertexSphere);
};

export const getFaceIndices = async (mesh) => {
  mesh.updateMatrixWorld();
  const worldMatrix = mesh.matrixWorld;

  const indexedGeom = BufferGeometryUtils.mergeVertices(
    mesh.geometry.clone(),
    0.0001
  );
  const indices = indexedGeom.getIndex();
  const positions = indexedGeom.getAttribute("position");

  const polygons = [];

  for (let i = 0; i < indices.count; i += 3) {
    const v1 = indices.getX(i);
    const v2 = indices.getX(i + 1);
    const v3 = indices.getX(i + 2);

    const p1 = new THREE.Vector3(
      positions.getX(v1),
      positions.getY(v1),
      positions.getZ(v1)
    );
    const p2 = new THREE.Vector3(
      positions.getX(v2),
      positions.getY(v2),
      positions.getZ(v2)
    );
    const p3 = new THREE.Vector3(
      positions.getX(v3),
      positions.getY(v3),
      positions.getZ(v3)
    );

    p1.applyMatrix4(worldMatrix);
    p2.applyMatrix4(worldMatrix);
    p3.applyMatrix4(worldMatrix);

    polygons.push(new Triangle(new THREE.Triangle(p1, p2, p3), i / 3));
  }

  return polygons;
};
