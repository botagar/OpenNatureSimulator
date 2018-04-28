import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import Seed from "../common/seed"
import { Vector3, Scene, Mesh, SphereGeometry, MeshBasicMaterial } from "three"

class PlantNode implements IGrowable, IRenderable {
  isInScene: boolean
  mesh: Mesh
  position: Vector3
  auxinLevel: number
  previousNode: PlantNode
  nextNode: PlantNode

  constructor(position: Vector3) {
    this.position = position
  }

  SetNextNode = (nextNode: PlantNode) => {
    this.nextNode = nextNode
  }

  SetPreviousNode = (previousNode: PlantNode) => {
    this.previousNode = previousNode
  }

  PrepareRender = (scene: Scene) => {
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => { }

  private CreateMesh = (): Mesh => {
    let geometry = new SphereGeometry(0.75, 16, 16)
    let material = new MeshBasicMaterial({
      color: 0x00FF00
    })
    let sphere = new Mesh(geometry, material)
    let { x, y, z } = this.position
    sphere.position.set(x, y, z)
    return sphere
  }
}

export default PlantNode
