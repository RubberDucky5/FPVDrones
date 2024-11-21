import { Engine } from "./engine.js";
import { FPVController } from "./game.js";

import { TextureLoader, EquirectangularReflectionMapping } from "three";

let engine = new Engine();
engine.testScene();

new TextureLoader().load("https://acg-download.struffelproductions.com/file/ambientCG-Web/download/IndoorEnvironmentHDRI003_iGaz2IwB/IndoorEnvironmentHDRI003_4K-TONEMAPPED.jpg", (texture)=>{
  texture.mapping = EquirectangularReflectionMapping;
  
  engine.scene.background = texture;
});

let c = new FPVController(engine);