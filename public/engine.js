import * as THREE from "three";
import {Octree} from "./static/octree.js";


class Engine {
  constructor() {
    this.setup();
    
    this._lastUpdate = performance.now(); // Can cause weird things with long load times
    this._ignoreDeltaTime = true;
    this.renderer.setAnimationLoop(this._update.bind(this));
    
    this.updateFuncs = [];
    
    // this.testScene();
    
    this.enabled = false;
    this.focused = true;
    
    this.octree = new Octree();
    
    window.addEventListener("blur", this._blur.bind(this));
    window.addEventListener("focus", this._focus.bind(this));
  }
  
  _update () {
    if(!this.focused)
      return;
    
    if(!this.enabled)
      return;
    let deltaTime = performance.now() - this._lastUpdate;
    
    if(this._ignoreDeltaTime) {
      deltaTime = 1;
      this._ignoreDeltaTime = false;
    }
    
    for(let f of this.updateFuncs) {
      f(this, deltaTime / 1000);
    }
    
    this.renderer.render(this.scene, this.camera);
    this._lastUpdate = performance.now();
  }
  
  resize (e) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }
  
  _blur(e) {
    this.focused = false;
    this._ignoreDeltaTime = true;
  }
  
  _focus(e) {
    this.focused = true;
  }
  
  setup () {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    window.addEventListener("resize", this.resize.bind(this));
  }
  
  // Meant to be call in conjunction with setup
  destroy () {
    document.body.removeChild(this.renderer.domElement);
    
    // Might want to add removing the resize listener
  }
  
  mouseCaptureOn () {
    document.addEventListener("mousedown", this._mouseCapture);
  }
  
  mouseCaptureOff () {
    document.removeEventListener("mousedown", this._mouseCapture);
  }
  
  _mouseCapture (e) {
    if (document.pointerLockElement === null) {
      document.body.requestPointerLock();
    }
  }

  testScene() {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    this.camera.position.z = 5;
    
    this.camera.position.z = 5;

    let animate = (e, dt) => {
      cube.rotation.x += 0.1*dt*60;
      cube.rotation.y += 0.07*dt*60;
    }
    this.updateFuncs.push( animate );
  }
}

class InputAxis {
  constructor  (params) {
    this.nKey = 0;
    this.pKey = 0;
    this.gpIndex = -1;
    
    this.deadZone = 0.15;
    this.linearity = 0.2;
    Object.assign(this, params);
    
    this.filter=this.cubicFilter
    
    this.update();
  }
  
  update() {
    if(this.gpIndex >= 0){
      this.gpAxis = new GamepadAxis(this.gpIndex);
    } else this.gpAxis = new Axis();
    
    if(this.nKey > 0 && this.pKey > 0) {
      this.keyAxis = new KeyAxis(this.nKey, this.pKey);
    } else this.keyAxis = new Axis();
  }
  
  get raw () {
    if(Math.abs(this.gpAxis.axis) < Math.abs(this.keyAxis.axis))
      return this.keyAxis.axis;
    
    return this.gpAxis.axis;
  }
  
  get filtered () {
    let dz = Math.abs(this.raw) > this.deadZone ? this.raw : 0;
    
    return this.filter(dz);
  }
  
  cubicFilter(x) {
    let w = 1-this.linearity;
    return w*x*x*x + x*(1-w);
  }
  
  throttleFilter (x) {
    return this.cubicFilter(-x)/2 + 0.5
  }
}
  
class Axis {
  constructor () {
    
  }
  
  get axis () {
    return 0;
  }
}

class GamepadAxis {
  constructor (index=0) {
    this.index = index;
    this.gamepad = 0;
  }
  
  get axis () {
    let gp = navigator.getGamepads()[this.gamepad];
    
    if(gp == null){
      return 0;
    }else {
      return gp.axes[this.index];
    }
  }
}

class KeyAxis {
  constructor(n,p) {
    this.nk = n;
    this.pk = p;
    
    this.nw = 0;
    this.pw = 0;

    
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }
  
  get axis () {
    return -1 * this.nw + this.pw;
  }
  
  onKeyDown (e) {
    if(e.keyCode == this.nk)
      this.nw = 1;
    if(e.keyCode == this.pk)
      this.pw = 1;
  }
  onKeyUp (e) {
    if(e.keyCode == this.nk)
      this.nw = 0;
    if(e.keyCode == this.pk)
      this.pw = 0;
  }
}

export { Engine, GamepadAxis, KeyAxis, InputAxis, Axis };
