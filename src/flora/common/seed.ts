import { Vector3 } from "three"
import DNA from "./dna"

class Seed {
  sugarLevel: number
  dna: DNA
  position: Vector3
  
  constructor(startPosition: THREE.Vector3, dna: DNA, sugar: number) {
    this.position = startPosition
    this.dna = dna
    this.sugarLevel = sugar
  }
}

export default Seed
