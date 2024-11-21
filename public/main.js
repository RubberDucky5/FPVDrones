import { Engine } from "./engine.js";
import { FPVController } from "./game.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

import { TextureLoader, EquirectangularReflectionMapping, AmbientLight } from "three";

let engine = new Engine();

new TextureLoader().load("https://acg-download.struffelproductions.com/file/ambientCG-Web/download/DayEnvironmentHDRI043_B7jR5eCE/DayEnvironmentHDRI043_2K-TONEMAPPED.jpg", (texture)=>{
  texture.mapping = EquirectangularReflectionMapping;
  
  engine.scene.background = texture;
  engine.scene.environment = texture;
});

// engine.scene.add(new AmbientLight( 0xffffff ));

let loader = new GLTFLoader().setPath("levels/");
loader.load("test.gltf", (gltf) => {
  engine.scene.add(gltf.scene);
})


let c = new FPVController(engine);