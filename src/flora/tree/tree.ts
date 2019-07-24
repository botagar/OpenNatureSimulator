import Seed from "../common/seed"
import { Vector3 } from "three"
import Stem from "./stem"
import Flora from "../common/flora"
import DNA from "../common/dna"
import PlantNode from "./node"

declare var TempEnergy: number

class Tree extends Flora {
  dna: DNA
  basePosition: Vector3
  baseStem: Stem
  stems: Stem[]

  constructor(seed?: Seed) {
    super()
    // TempEnergy = 1000
    this.stems = []
    let _seed = seed || new Seed(new Vector3, new DNA, 1000)
    this.dna = _seed.dna
    this.basePosition = _seed.position
    let startingStem = Stem.FromSeed(this, _seed)
    startingStem.on('CreateNewStem', this.eventHandlers['CreateNewStem'])
    this.stems.push(startingStem)
    this.baseStem = startingStem
  }

  AddStemToEnd(newStem: Stem) {
    let leadingStem = this.stems.find(stem => stem.node.nextNode == null)
    if (leadingStem) newStem.AttachToEndOf(leadingStem)
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
    console.warn('-------------------- Top Level Process Logic --------------------')
    let auxinEqn = (distFromTip: number, auxinAtTip: number, maxFlowRate: number):number => {
      let auxinTransfer = (-0.8 * distFromTip) + auxinAtTip
      return auxinTransfer > maxFlowRate ? maxFlowRate : auxinTransfer
    }
    let allEndStems = this.stems.filter(stem => stem.node.nextNode == null)
    console.log('EndStems: ', allEndStems)

    allEndStems.forEach((stem, index) => {
      stem.PropagateAuxinDownstream()
    })

    this.stems.forEach(stem => stem.ProcessLogic())
  }

  private ProcessAuxinFromApexBud = (currentNode: PlantNode) => {
    let { phloem } = currentNode.parent.interNode.Properties
    let apexBud = currentNode.parent.apexBud
    apexBud.ProduceAuxin()
    currentNode.InjectAuxin(apexBud.ExtractAuxin(phloem))
    apexBud.SetAuxin(currentNode.properties.auxinLevel)
  }
}

export default Tree
