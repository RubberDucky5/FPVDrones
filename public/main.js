import { Engine } from "./engine.js";
import { FPVController } from "./game.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { AmmoPhysics } from "three/addons/physics/AmmoPhysics.js";
import * as THREE from "three";

import {
  TextureLoader,
  EquirectangularReflectionMapping,
  AmbientLight,
} from "three";

let engine = new Engine();

// Background
new TextureLoader().load(
  "https://acg-download.struffelproductions.com/file/ambientCG-Web/download/DayEnvironmentHDRI024_52uogOBP/DayEnvironmentHDRI024_2K-TONEMAPPED.jpg",
  (texture) => {
    texture.mapping = EquirectangularReflectionMapping;

    engine.scene.background = texture;
    engine.scene.environment = texture;
  }
);

let loader = new GLTFLoader().setPath("levels/");
loader.load("test.gltf", (gltf) => {
  let scene = gltf.scene;

  engine.scene.add(scene);

  engine.enabled=true;
});

let c = new FPVController(engine);
