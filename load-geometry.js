import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const SCALING_FACTOR = 1;

export const loadObject = async (path, scene, main) => {
  return new Promise((resolve, reject) => {
    const stlloader = new STLLoader();
    stlloader.load(
      path,
      (geo) => {
        const geometry = new THREE.WireframeGeometry(geo);
        geometry.scale(SCALING_FACTOR, SCALING_FACTOR, SCALING_FACTOR);
        const material = new THREE.LineBasicMaterial({
          color: main ? "RED" : "BLUE",
        });
        const wireframe = new THREE.LineSegments(geometry, material);
        scene.add(wireframe);

        let coloredMesh;
        const fillmaterial = new THREE.MeshBasicMaterial({
          color: "LIGHTGREEN",
          opacity: main ? 1 : 0.03,
          transparent: true,
        });
        fillmaterial.polygonOffset = true;
        fillmaterial.polygonOffsetUnits = 1;
        coloredMesh = new THREE.Mesh(
          geo.scale(SCALING_FACTOR, SCALING_FACTOR, SCALING_FACTOR),
          fillmaterial
        );
        scene.add(coloredMesh);

        console.log(`Added ${path}`);
        resolve({ wireframe, coloredMesh });
      },
      undefined,
      (error) => {
        console.error(error);
        reject(error);
      }
    );
  });
};

export default loadObject;
