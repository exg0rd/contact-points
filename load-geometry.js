import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const SCALING_FACTOR = 0.05;

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
        geometry.computeBoundingBox();
        // const boundingBox = geometry.boundingBox;
        // const center = new THREE.Vector3();
        // boundingBox.getCenter(center);
        // wireframe.position.sub(center);
        scene.add(wireframe);

        let coloredMesh;
        if (main == true) {
          const fillmaterial = new THREE.MeshBasicMaterial({
            color: "LIGHTGREEN",
          });
          fillmaterial.polygonOffset = true;
          fillmaterial.polygonOffsetUnits = 1;
          fillmaterial.opacity = 0.6;
          coloredMesh = new THREE.Mesh(
            geo.scale(SCALING_FACTOR, SCALING_FACTOR, SCALING_FACTOR),
            fillmaterial
          );
          scene.add(coloredMesh);
          // coloredMesh.position.sub(center);
        }

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
