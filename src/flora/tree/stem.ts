import PlantNode from "./node"
import InterNode from "./interNode"
import Seed from "../common/seed"
import { Line3, Vector3 } from 'three'
import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"

class Stem implements IGrowable, IRenderable {
  node: PlantNode
  interNode: InterNode
  growthLine: Line3
  growthTimeScale: number = 10 //seconds

  protected constructor(startPosition: Vector3) {
    // Calculate new growth end point
    let projectedEndPosition = new Vector3
    let endPosition = startPosition.clone().add(new Vector3(0,10,0))
    this.growthLine = new Line3(startPosition, endPosition)
    this.node = new PlantNode(startPosition)
    this.interNode = new InterNode(this.growthLine, this.growthTimeScale, 8)
  }

  static FromSeed = (seed: Seed): Stem => {
    return new Stem(seed.position)
  }

  static NewStemAtEndOf = (stem: Stem): Stem => {
    let startPos = stem.growthLine.end
    let newStem = new Stem(startPos)
    newStem.AttachToEndOf(stem)
    return newStem
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
