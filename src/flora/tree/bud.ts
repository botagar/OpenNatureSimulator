import { EventEmitter } from "events"
import DNA from "../common/dna"
import IRenderable from "../common/IRenderable"
import IGrowable from "../common/IGrowable"
import { Scene, SphereGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three"

class Bud extends EventEmitter implements IRenderable, IGrowable {
  isInScene: boolean
  mesh: Mesh
  position: Vector3
  dna: DNA
  
  constructor(dna: DNA, position: Vector3) {
    super()
    this.dna = dna
    this.position = position
  }
  
  PrepareRender = (scene: Scene, timeDelta?: number) => {
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => {}

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
