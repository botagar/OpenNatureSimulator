import { EventEmitter } from "events"
import DNA from "../common/dna"
import IRenderable from "../common/IRenderable"
import IGrowable from "../common/IGrowable"
import { Scene, SphereGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three"
import PlantNode from "./node";

class Bud extends EventEmitter implements IRenderable, IGrowable {
  parent: PlantNode
  dna: DNA
  isInScene: boolean
  mesh: Mesh
  position: Vector3
  angleOnStem: number

  constructor(parent: PlantNode, position: Vector3, angleOnStem: number) {
    super()
    this.parent = parent
    this.dna = parent.dna
    this.position = position
    this.angleOnStem = angleOnStem
  }

  Properties = {
    sugarLevel: 0,
    auxinLevel: 0,
    maxSugarLevel: 10,
    sugarDemand: 1,
    auxinSupply: 1,
    auxinResistance: 1,
    shutdownThreshold: 10,
    wakeupThreshold: 3
  }

  ProduceAuxin = () => {
    let { sugarLevel, auxinSupply } = this.Properties
    let consumedSugar, auxinProduced
    if (sugarLevel - auxinSupply > 0) {
      consumedSugar = auxinSupply
      auxinProduced = auxinSupply
      this.Properties.auxinSupply += 0.85 * consumedSugar
    } else {
      consumedSugar = sugarLevel
      auxinProduced = consumedSugar
      this.Properties.auxinSupply = consumedSugar
    }
    // this.Parameters.sugarLevel -= consumedSugar
    this.Properties.sugarDemand = consumedSugar
    this.Properties.auxinLevel = auxinProduced
    if (auxinProduced > 0) {
      this.Properties.auxinResistance += auxinProduced + 1
    } else {
      if (this.Properties.auxinResistance - 1 >= 0) this.Properties.auxinResistance -= 1
    }
    this.parent.properties.auxinLevel += auxinProduced
  }

  ExtractAuxin = (amount: number): number => {
    if (this.Properties.auxinLevel - amount > 0) {
      this.Properties.auxinLevel -= amount
      return amount
    }
    let auxinExtracted = this.Properties.auxinLevel
    this.Properties.auxinLevel = 0
    return auxinExtracted
  }

  SetAuxin = (amount: number) => {
    this.Properties.auxinLevel = amount
  }

  AcceptResources = (dSugar: number) => {
    this.Properties.sugarLevel += dSugar
  }

  PrepareRender = (scene: Scene, timeDelta?: number) => {
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => {
    // TODO: Redo this logic to take into account axin levels
    // let leafChance = this.dna.rand()
    // if (leafChance > 0.75) {
    //   this.parent.emit('CreateLeafFromBud', this)
    //   return null
    // }
    // let stemChance = this.dna.rand()
    // if (stemChance > 0.95) {
    //   this.parent.emit('CreateStemFromBud', this)
    //   return null
    // }
    if (this.parent.nextNode) this.parent.emit('CreateLeafFromBud', this)     
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
