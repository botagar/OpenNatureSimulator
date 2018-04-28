import { Vector3 } from "three"

class Seed {
  position: Vector3
  
  constructor(startPosition: THREE.Vector3) {
    this.position = startPosition
  }
}

export default Seed
