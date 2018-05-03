import PlantNode from "./node"
import InterNode from "./interNode"
import Seed from "../common/seed"
import { Line3, Vector3 } from 'three'
import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import Bud from "./bud"
import DNA from "../common/dna"
import { EventEmitter } from "events"
import Tree from "./tree";

class Stem extends EventEmitter implements IGrowable, IRenderable {
  parent: Tree
  stemsFromBase: number
  dna: DNA
  node: PlantNode
  interNode: InterNode
  apexBud: Bud
  growthLine: Line3
  growthTimeScale: number = 2 //seconds

  static FromSeed = (caller: Tree, seed: Seed): Stem => {
    let stem = new Stem(caller, seed.position, 0)
    stem.node.properties.sugarLevel = seed.sugarLevel
    let apexBud = new Bud(stem.node, stem.growthLine.start.clone(), 0)
    apexBud.Properties.sugarLevel = seed.sugarLevel - stem.interNode.Properties.maxSugarFlowPerMin > 0
      ? stem.interNode.Properties.maxSugarFlowPerMin : seed.sugarLevel
    stem.apexBud = apexBud
    return stem
  }

  static NewStemAtEndOf = (caller: Tree, stem: Stem): Stem => {
    let startPos = stem.growthLine.end
    let newStem = new Stem(caller, startPos, stem.stemsFromBase + 1)
    newStem.AttachToEndOf(stem)
    return newStem
  }

  protected constructor(parent: Tree, startPosition: Vector3, countFromBase: number) {
    super()
    this.parent = parent
    this.dna = parent.dna
    this.stemsFromBase = countFromBase
    // Calculate new growth end point
    let projectedEndPosition = new Vector3
    let endPosition = startPosition.clone().add(new Vector3(0, 1, 0))
    this.growthLine = new Line3(startPosition, endPosition)
    this.node = new PlantNode(this, startPosition)
    this.interNode = new InterNode(this, 8)
    this.AttachEventListeners()
  }

  private AttachEventListeners() {
    this.interNode.on('MaxLengthReached', () => {
      this.emit('CreateNewStem', this)
      this.node.emit('CreateSecondaryBuds')
    })
  }

  AttachToEndOf(prevStem: Stem) {
    prevStem.node.SetNextNode(this.node)
    this.node.SetPreviousNode(prevStem.node)
    this.node.properties.auxinLevel = prevStem.node.properties.auxinLevel
    this.apexBud = prevStem.apexBud
    this.apexBud.parent = this.node
    prevStem.apexBud = null
    prevStem.node.buds.splice(prevStem.node.buds.findIndex(bud => bud == this.apexBud), 1)
    this.node.buds.push(this.apexBud)
  }

  PropagateAuxinDownstream = () => {
    if (this.apexBud) this.apexBud.ProduceAuxin()
    let downstreamNode = this.node.previousNode
    if (!downstreamNode) return null
    let auxinAtDest = this.node.properties.auxinLevel * 0.6
    if (auxinAtDest < 0.1) {
      downstreamNode.SetAuxin(0)
    } else {
      downstreamNode.SetAuxin(auxinAtDest)
      downstreamNode.parent.PropagateAuxinDownstream()
    }
  }

  PrepareRender = (scene: THREE.Scene, deltaTime: number) => {
    this.node.PrepareRender(scene)
    this.interNode.PrepareRender(scene, deltaTime)
    if (this.apexBud) {
      this.apexBud.PrepareRender(scene, deltaTime)
      let { x, y, z } = this.interNode.currentGrowth.end
      this.apexBud.mesh.position.set(x, y, z)
      this.apexBud.position.set(x, y, z)
    }
  }

  ProcessLogic = () => {
    this.node.ProcessLogic()
    this.interNode.ProcessLogic()
  }
}

export default Stem
