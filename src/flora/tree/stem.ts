import PlantNode from "./node"
import InterNode from "./interNode"
import Seed from "../common/seed"
import { Line3, Vector3 } from 'three'
import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import Bud from "./bud"
import DNA from "../common/dna"
import { EventEmitter } from "events"
import Branch from "./branch"

class Stem extends EventEmitter implements IGrowable, IRenderable {
  parent: any
  stemsFromBase: number
  dna: DNA
  node: PlantNode
  interNode: InterNode
  buds: Bud
  growthLine: Line3
  growthTimeScale: number = 2 //seconds

  static FromSeed = (caller: any, seed: Seed): Stem => {
    return new Stem(caller, seed.position, 0)
  }

  static NewStemAtEndOf = (caller: any, stem: Stem): Stem => {
    let startPos = stem.growthLine.end
    let newStem = new Stem(caller, startPos, stem.stemsFromBase + 1)
    newStem.AttachToEndOf(stem)
    return newStem
  }

  protected constructor(parent: any, startPosition: Vector3, countFromBase: number) {
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
    })
  }

  AttachToEndOf(stem: Stem) {
    stem.node.SetNextNode(this.node)
    this.node.SetPreviousNode(stem.node)
    this.node.auxinLevel = stem.node.auxinLevel
  }

  PrepareRender = (scene: THREE.Scene, deltaTime: number) => {
    this.node.PrepareRender(scene)
    this.interNode.PrepareRender(scene, deltaTime)
  }

  ProcessLogic = () => {
    this.node.ProcessLogic()
    this.interNode.ProcessLogic()
  }
}

export default Stem
