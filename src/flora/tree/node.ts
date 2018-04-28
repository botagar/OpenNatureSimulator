import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import Seed from "../common/seed"
import { Vector3, Scene, Mesh, SphereGeometry, MeshBasicMaterial } from "three"
import DNA from "../common/dna"
import Bud from "./bud"
import Stem from "./stem"

class PlantNode implements IGrowable, IRenderable {
  parent: Stem
  nodeIndexFromBase: number
  buds: Bud[]
  dna: DNA
  isInScene: boolean
  mesh: Mesh
  position: Vector3
  auxinLevel: number
  previousNode: PlantNode
  nextNode: PlantNode

  constructor(parent: Stem, position: Vector3) {
    this.parent = parent
    this.dna = parent.dna
    this.nodeIndexFromBase = parent.stemsFromBase
    this.position = position
    this.buds = []
    
    this.CreateBuds()
  }

  private CreateBuds = () => {
    let numberOfBuds = 1
    let budδθ = 2 * Math.PI / 4 * this.nodeIndexFromBase
    let budδφ = 2 * Math.PI / numberOfBuds
    let radius = 1
    for (let i = 0; i < numberOfBuds; i++) {
      let x = this.position.x + (radius * Math.cos(budδθ + budδφ))
      let y = this.position.y
      let z = this.position.z + (radius * Math.sin(budδθ + budδφ))
      let bud = new Bud(this, new Vector3(x, y, z))
      this.buds.push(bud)
    }
  }

  SetNextNode = (nextNode: PlantNode) => {
    this.nextNode = nextNode
  }

  SetPreviousNode = (previousNode: PlantNode) => {
    this.previousNode = previousNode
  }

  PrepareRender = (scene: Scene) => {
    this.buds.forEach(bud => bud.PrepareRender(scene))
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => { }

  private CreateMesh = (): Mesh => {
    let geometry = new SphereGeometry(0.25, 16, 16)
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
