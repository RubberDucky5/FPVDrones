import { Quaternion,
         Vector3,
       } from "three";
import { InputAxis } from "./engine.js";

class FPVController {
  constructor(engine) {
    this.yaw = new InputAxis({ gpIndex: 0, nKey: 65, pKey: 68 });
    this.throttle = new InputAxis({ gpIndex: 1, nKey: 83, pKey: 87 });
    this.roll = new InputAxis({ gpIndex: 2, nKey: 74, pKey: 76 });
    this.pitch = new InputAxis({ gpIndex: 3, nKey: 75, pKey: 73 });

    this.sens = 8;
    
    this.pos = new Vector3(0,0,-5);
    
    this.up = new Vector3(0,1,0);
    this.forward = new Vector3(0,0,1);
    
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
    
    this.pos.add(this.up.clone().multiplyScalar(-this.throttle.filtered));
    e.camera.position.set(this.pos.x, this.pos.y, this.pos.z);
    e.camera.up = this.up;
    e.camera.lookAt(e.camera.position.clone().add(this.forward));
    
    e.camera.updateWorldMatrix();
  }
}

export { FPVController };
