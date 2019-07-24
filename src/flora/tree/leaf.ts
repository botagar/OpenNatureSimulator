import IRenderable from "../common/IRenderable"
import IGrowable from "../common/IGrowable"
import * as fs from 'fs'
import { Scene, Mesh, Vector3, Line3, PlaneBufferGeometry, MeshLambertMaterial, DoubleSide, UniformsLib, UniformsUtils, ShaderMaterial } from "three"
import { EventEmitter } from "events"
import PlantNode from "./node"
import Bud from "./bud"
import DNA from "../common/dna"

class Leaf extends EventEmitter implements IRenderable, IGrowable {
  parent: PlantNode
  parentBud: Bud
  dna: DNA
  position: Vector3
  lightMapMesh: Mesh
  mesh: Mesh
  petitole: Line3
  isInScene: boolean

  constructor(parent: PlantNode, parentBud: Bud, dna: DNA, position: Vector3) {
    super()
    this.parent = parent
    this.parentBud = parentBud
    this.dna = dna
    this.position = position
  }

  Properties = {
    width: 2,
    length: 4,
    resolution: 2,
    stomata: 10 // Max Gas Flow (CO2, O2 etc...)
  }

  static FromBud = (bud: Bud) => {
    let leaf = new Leaf(bud.parent, bud, bud.dna, bud.position.clone())
    return leaf
  }

  ProcessLogic = () => {
    // Do shader stuff to calc shadow map
    let lightArea = 1.0
    this.parent.properties.auxinLevel += 10 * lightArea
  }

  PrepareRender = (scene: Scene, timeDelta?: number) => {
    if (!this.mesh) this.mesh = this.CreateVisibleMesh()
    if (!this.lightMapMesh) this.lightMapMesh = this.CreateLightMapMesh()
    if (this.isInScene) return null
    scene.add(this.mesh)
    scene.add(this.lightMapMesh)
    this.isInScene = true
  }

  private CreateVisibleMesh = (): Mesh => {
    let { width, length, resolution } = this.Properties
    let leafGeometry = new PlaneBufferGeometry(width, length, resolution, resolution)
    leafGeometry.translate(0, length / 2, 0)
    let leafVisibleMaterial = new MeshLambertMaterial({
      color: 0x00FF00,
      side: DoubleSide,
      transparent: true,
      opacity: 0.4
    })

    let visibleLeafMesh = new Mesh(leafGeometry, leafVisibleMaterial)
    visibleLeafMesh.rotateX(-Math.PI / 2)

    let { x, y, z } = this.position
    visibleLeafMesh.position.set(x, y, z)
    visibleLeafMesh.castShadow = true
    visibleLeafMesh.receiveShadow = true
    let θ = -this.parentBud.angleOnStem - (Math.PI / 2)
    visibleLeafMesh.rotateZ(θ)

    return visibleLeafMesh
  }

  private CreateLightMapMesh = (): Mesh => {
    let { width, length, resolution } = this.Properties
    let vertShader = fs.readFileSync('src/shaders/leaf_vert.glsl', { encoding: 'utf8' })
    let fragShader = fs.readFileSync('src/shaders/leaf_frag.glsl', { encoding: 'utf8' })
    let uniforms = UniformsUtils.merge([
      UniformsLib['lights'],
      {
        time: { type: "f", value: 0 }
      }
    ])
    let leafGeometry = new PlaneBufferGeometry(width, length, resolution, resolution)
    leafGeometry.translate(0, length / 2, 0)

    let lightMaterial = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      lights: true
    })

    let lightMesh = new Mesh(leafGeometry, lightMaterial)
    lightMesh.rotateX(-Math.PI / 2)

    let { x, y, z } = this.position
    lightMesh.position.set(x, y, z)
    lightMesh.castShadow = true
    lightMesh.receiveShadow = true
    lightMesh.visible = false

    return lightMesh
  }
}

export default Leaf
