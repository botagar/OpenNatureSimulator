import Stem from "./stem";
import IRenderable from "../common/IRenderable"
import IGrowable from "../common/IGrowable"

class Branch implements IRenderable, IGrowable {
  stems: Stem[]
  
  constructor() {
    this.stems = []
  }
  
  AddStemToEnd(newStem: Stem) {
    let leadingStem = this.stems.find(stem => stem.node.nextNode == null)
    if (leadingStem ) newStem.AttachToEndOf(leadingStem)
    this.stems.push(newStem)
  }
  
  PrepareRender = (scene: THREE.Scene, deltaTime: number) => {
    this.stems.forEach(stem => stem.PrepareRender(scene, deltaTime))
  }

  ProcessLogic = () => {
    this.stems.forEach(stem => stem.ProcessLogic())
  }
}

export default Branch
