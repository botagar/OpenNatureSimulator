import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import Seed from "../common/seed"
import { Vector3, Scene, Mesh, SphereGeometry, MeshBasicMaterial } from "three"
import DNA from "../common/dna"
import Bud from "./bud"
import Stem from "./stem"
import { EventEmitter } from "events"
import Leaf from "./leaf"

class PlantNode extends EventEmitter implements IGrowable, IRenderable {
  parent: Stem
  nodeIndexFromBase: number
  buds: Bud[]
  budsToRemove: Bud[]
  leaves: Leaf[]
  dna: DNA
  isInScene: boolean
  mesh: Mesh
  position: Vector3
  previousNode: PlantNode
  nextNode: PlantNode

  constructor(parent: Stem, position: Vector3) {
    super()
    this.parent = parent
    this.dna = parent.dna
    this.nodeIndexFromBase = parent.stemsFromBase
    this.position = position
    this.buds = []
    this.leaves = []
    this.budsToRemove = []

    this.on('CreateSecondaryBuds', this.CreateBuds)
    this.on('CreateLeafFromBud', this.CreateLeafFromBud)
    this.on('CreateStemFromBud', this.CreateStemFromBud)
  }

  properties = {
    sugarLevel: 0,
    auxinLevel: 0
  }

  private CreateBuds = () => {
    let numberOfBuds = 1
    let budδθ = Math.PI / 4 * this.nodeIndexFromBase
    let budδφ = 2 * Math.PI / numberOfBuds
    let radius = 1
    for (let i = 0; i < numberOfBuds; i++) {
      let angle = (budδθ + (budδφ * i)) % (2 * Math.PI);
      let x = this.position.x + (radius * Math.cos(angle))
      let y = this.position.y
      let z = this.position.z + (radius * Math.sin(angle))
      let bud = new Bud(this, new Vector3(x, y, z), angle)
      this.buds.push(bud)
    }
  }

  private CreateLeafFromBud = (bud: Bud) => {
    console.log('Creating leaf from bud')
    let leaf = Leaf.FromBud(bud)
    this.budsToRemove.push(bud)
    this.buds.splice(this.buds.findIndex(_bud => _bud == bud), 1)
    bud.removeAllListeners()
    this.leaves.push(leaf)
  }

  private CreateStemFromBud = (bud: Bud) => {
    console.warn('Create stem from bud not yet implemented')
  }

  SetNextNode = (nextNode: PlantNode) => {
    this.nextNode = nextNode
  }

  SetPreviousNode = (previousNode: PlantNode) => {
    this.previousNode = previousNode
  }

  SetAuxin = (amount: number) => {
    this.properties.auxinLevel = amount < 0 ? 0 : amount
    this.buds.forEach(bud => {
      bud.SetAuxin(this.properties.auxinLevel)
    })
  }

  InjectAuxin = (amount: number) => {
    this.properties.auxinLevel += amount
    this.buds.forEach(bud => {
      bud.SetAuxin(this.properties.auxinLevel)
    })
  }

  PrepareRender = (scene: Scene) => {
    this.buds.forEach(bud => bud.PrepareRender(scene))
    this.budsToRemove.forEach(bud => scene.remove(bud.mesh))
    this.budsToRemove = []
    this.leaves.forEach(leaf => leaf.PrepareRender(scene))
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => {
    this.leaves.forEach(leaf => leaf.ProcessLogic())
    this.buds.forEach(bud => bud.ProcessLogic())    
  }

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
