import { EventEmitter } from "events"
import DNA from "../common/dna"
import IRenderable from "../common/IRenderable"
import IGrowable from "../common/IGrowable"
import { Scene, SphereGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three"
import PlantNode from "./node";

class Bud extends EventEmitter implements IRenderable, IGrowable {
  parent: PlantNode
  isInScene: boolean
  mesh: Mesh
  position: Vector3
  dna: DNA
  
  constructor(parent: PlantNode, position: Vector3) {
    super()
    this.parent = parent
    this.dna = parent.dna
    this.position = position
  }

  growthParams = {
    sugarAccumilated: 10,
    auxinAccumilated: 0,
    sugarConsumedPerMin: 1,
    auxinProducedPerMin: 1,
    auxinResistance: 1,
    shutdownThreshold: 10,
    wakeupThreshold: 3
  }
  
  PrepareRender = (scene: Scene, timeDelta?: number) => {
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => {

  }

  private CreateMesh = () => {
    let geometry = new SphereGeometry(0.25, 16, 16)
    let material = new MeshBasicMaterial({
      color: 0x0000FF
    })
    let sphere = new Mesh(geometry, material)
    let { x, y, z } = this.position
    sphere.position.set(x, y, z)
    return sphere
  }
}

export default Bud
