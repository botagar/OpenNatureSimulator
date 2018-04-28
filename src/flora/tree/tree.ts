import Seed from "../common/seed"
import { Vector3 } from "three"
import Branch from "./branch"
import Stem from "./stem"
import Flora from "../common/flora";

class Tree extends Flora {
  basePosition: Vector3
  branches: Branch[]
  
  constructor(seed?: Seed) {
    super()
    let _seed = seed || new Seed(new Vector3)
    this.basePosition = _seed.position
    let startingStem = Stem.FromSeed(_seed)
    let startingBranch = new Branch
    startingBranch.AddStemToEnd(startingStem)
    this.branches = [startingBranch]
  }
  
  PrepareRender = (scene: THREE.Scene, deltaTime: number) => {
    this.branches.forEach(branch => branch.PrepareRender(scene, deltaTime))
  }
  
  ProcessLogic = () => {
    this.branches.forEach(branch => branch.ProcessLogic())
  }
}

export default Tree