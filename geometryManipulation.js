import * as THREE from "three";

export const getVertices = (geometry) => {
  const positionAttribute = geometry.getAttribute("position");
  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);
    console.log(x, y, z);
  }
};
