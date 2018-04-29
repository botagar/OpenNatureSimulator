import Seed from "../common/seed"
import { Vector3 } from "three"
import Stem from "./stem"
import Flora from "../common/flora";
import DNA from "../common/dna";

class Tree extends Flora {
  dna: DNA
  basePosition: Vector3
  stems: Stem[]
  
  constructor(seed?: Seed) {
    super()
    this.stems = []
    let _seed = seed || new Seed(new Vector3, new DNA)
    this.dna = _seed.dna
    this.basePosition = _seed.position
    let startingStem = Stem.FromSeed(this, _seed)
    startingStem.on('CreateNewStem', this.eventHandlers['CreateNewStem'])
    this.stems.push(startingStem)
  }

  AddStemToEnd(newStem: Stem) {
    let leadingStem = this.stems.find(stem => stem.node.nextNode == null)
    if (leadingStem ) newStem.AttachToEndOf(leadingStem)
    newStem.on('CreateNewStem', this.eventHandlers['CreateNewStem'])
    this.stems.push(newStem)
  }

  eventHandlers = {
    CreateNewStem: (prevStem) => {
      let newStem = Stem.NewStemAtEndOf(this, prevStem)
      newStem.on('CreateNewStem', this.eventHandlers['CreateNewStem'])
      this.stems.push(newStem)
    }
  }
  
  PrepareRender = (scene: THREE.Scene, deltaTime: number) => {
    this.stems.forEach(stem => stem.PrepareRender(scene, deltaTime))
  }
  
  ProcessLogic = () => {
    let allEndStems = this.stems.filter(stem => stem.node.nextNode == null)
    console.log(allEndStems)
    //Sugar pass
    allEndStems.forEach((stem, index) => {
      while(true) {
        let nextStem = stem.node.previousNode.parent
        if (!nextStem) {
          console.log('Exit Traversal @ Level:', index)
          break
        }
      }
    })

    //Auxin pass
    this.stems.forEach(stem => stem.ProcessLogic())
  }
}

export default Tree
