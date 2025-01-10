import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

class Point {
  constructor(x, y, z, faceIndex) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._faceIndex = faceIndex;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get z() {
    return this._z;
  }

  get faceIndex() {
    return this._faceIndex;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  toVector3() {
    return new THREE.Vector3(this.x, this.y, this.z);
  }

  toString() {
    return `Point(x=${this.x}, y=${this.y}, z=${this.z}, faceIndex=${this.faceIndex})`;
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

  const sphereGeometry = new THREE.SphereGeometry(0.16, 16, 16);
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

export const getFaceIndices = async (mesh) => {
  const scene = mesh.parent;
  const geom = mesh.geometry;

  const indexedGeom = BufferGeometryUtils.mergeVertices(geom, 0.0001);
  const indices = indexedGeom.getIndex();
  console.log(indices);
  const positions = indexedGeom.getAttribute("position");

  const polygons = [];

  for (let i = 0; i < indices.count; i += 3) {
    const v1 = indices.getX(i);
    const v2 = indices.getX(i + 1);
    const v3 = indices.getX(i + 2);

    const p1 = [positions.getX(v1), positions.getY(v1), positions.getZ(v1)];
    const p2 = [positions.getX(v2), positions.getY(v2), positions.getZ(v2)];
    const p3 = [positions.getX(v3), positions.getY(v3), positions.getZ(v3)];

    polygons.push([p1, p2, p3]);
  }

  return polygons;
};
