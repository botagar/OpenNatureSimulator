import Stem from "./stem";
import IRenderable from "../common/IRenderable"
import IGrowable from "../common/IGrowable"
import DNA from "../common/dna"

class Branch implements IRenderable, IGrowable {
  dna: DNA
  stems: Stem[]
  
  constructor(dna?: DNA) {
    this.dna = dna
    this.stems = []
  }
  
  AddStemToEnd(newStem: Stem) {
    let leadingStem = this.stems.find(stem => stem.node.nextNode == null)
    if (leadingStem ) newStem.AttachToEndOf(leadingStem)
    newStem.on('CreateNewStem', this.eventHandlers['CreateNewStem'])
    this.stems.push(newStem)
  }
  
  PrepareRender = (scene: THREE.Scene, deltaTime: number) => {
    this.stems.forEach(stem => stem.PrepareRender(scene, deltaTime))
  }

  ProcessLogic = () => {
    this.stems.forEach(stem => stem.ProcessLogic())
  }

  eventHandlers = {
    CreateNewStem: (prevStem) => {
      let newStem = Stem.NewStemAtEndOf(this, prevStem)
      newStem.on('CreateNewStem', this.eventHandlers['CreateNewStem'])
      this.stems.push(newStem)
    }
  }
}

export default Branch
