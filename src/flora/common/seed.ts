import { Vector3 } from "three"
import DNA from "./dna"

class Seed {
  dna: DNA
  position: Vector3
  
  constructor(startPosition: THREE.Vector3, dna: DNA) {
    this.position = startPosition
    this.dna = dna
  }
}

export default Seed
