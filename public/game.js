import { Quaternion,
         Vector3,
         MathUtils,
         Raycaster
       } from "three";
import { InputAxis } from "./engine.js";

class FPVController {
  constructor(engine) {
    this.yaw = new InputAxis({ gpIndex: 0, nKey: 65, pKey: 68 });
    this.throttle = new InputAxis({ gpIndex: 1, nKey: 83, pKey: 87 });
    this.throttle.filter = this.throttle.throttleFilter;
    this.roll = new InputAxis({ gpIndex: 2, nKey: 74, pKey: 76 });
    this.pitch = new InputAxis({ gpIndex: 3, nKey: 75, pKey: 73 });

    this.sens = 6;
    
    this.pos = new Vector3(0,0,0);
    this.vel = new Vector3();
    
    this.mass = 0.05;
    
    this.up = new Vector3(0,1,0);
    this.forward = new Vector3(0,0,1);
    
    this.camAngle = 40;
    
    engine.updateFuncs.push(this.update.bind(this));
  }

  update(e, dt) {
    
    // Yaw
    this.forward.applyQuaternion(
      new Quaternion().setFromAxisAngle(
        this.up,
        -this.yaw.filtered * dt * this.sens
      ));
    
    // Roll
    this.up.applyQuaternion(
      new Quaternion().setFromAxisAngle(
        this.forward,
        this.roll.filtered * dt * this.sens
      )
    );
    
    // Pitch
    let cp = this.up.clone().cross(this.forward);
    
    this.up.applyQuaternion(
      new Quaternion().setFromAxisAngle(
        cp,
        -this.pitch.filtered * dt * this.sens
      )
    );
    this.forward.applyQuaternion(
      new Quaternion().setFromAxisAngle(
        cp,
        -this.pitch.filtered * dt * this.sens
      )
    );
    
    let force = new Vector3();
    force.add(this.up.clone().multiplyScalar(this.throttle.filtered * 1.8));
    let l = this.vel.length()
    force.sub(this.vel.clone().multiplyScalar(l*l * this.mass*this.mass * 0.05));
    
    let acc = new Vector3(0,-12,0);
    acc.add(force.multiplyScalar(1 / this.mass));
    
    // this.vel.add(this.up.clone().multiplyScalar(this.throttle.filtered / this.mass * dt * 1.80))
    
    this.vel.add(acc.multiplyScalar(dt));
    // this.vel.sub( this.vel.clone().multiplyScalar(0.985));
    this.pos.add(this.vel.clone().multiplyScalar(dt));
    
    e.camera.position.set(this.pos.x, this.pos.y, this.pos.z);
    e.camera.up = this.up;
    e.camera.lookAt(e.camera.position.clone().add(this.forward));
    e.camera.applyQuaternion(new Quaternion().setFromAxisAngle(
        cp,
        -MathUtils.degToRad(this.camAngle)
      ))
    
    
    e.camera.updateWorldMatrix();
  }
}

export { FPVController };
