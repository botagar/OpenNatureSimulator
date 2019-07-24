import { EventEmitter } from "events"
import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import { Scene, CylinderGeometry, Line3, FrontSide, MeshLambertMaterial, Mesh, Geometry, Vector3 } from "three"
import DNA from "../common/dna"
import Stem from "./stem"

class InterNode extends EventEmitter implements IGrowable, IRenderable {
  currentGrowth: Line3
  parent: Stem
  dna: DNA
  maxLength: number
  isAtMaxLength: boolean
  timeScale: number
  faceCount: number
  mesh: Mesh
  isInScene: boolean
  growthLine: Line3
  currentLength: number

  constructor(parent: Stem, faceCount: number) {
    super()
    this.parent = parent
    this.dna = parent.dna
    this.growthLine = parent.growthLine
    this.currentGrowth = new Line3(this.growthLine.start.clone(), this.growthLine.start.clone())
    this.timeScale = parent.growthTimeScale
    this.faceCount = faceCount
    this.maxLength = this.growthLine.distance()
    this.isAtMaxLength = false
  }

  Properties = {
    phloem: 10, // Max Sugar Flow + Auxin flow
    xylem: 10, // Max Water Flow
    // maxAuxinFlowPerMin: 10,
    auxinDiffuseRate: 2
  }

  PrepareRender = (scene: Scene, dt: number) => {
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isAtMaxLength) return null
    if (this.currentLength >= this.maxLength) {
      this.isAtMaxLength = true
      this.emit('MaxLengthReached')
      return null
    }
    if (dt) {
      let dY = (this.growthLine.distance() / this.timeScale) * (dt / 1000)
      let targetLength = new Vector3(0, this.currentLength + dY, 0)
      this.UpdateMesh(targetLength, 1, 1)
      this.currentLength += dY
      this.currentGrowth.end.add(new Vector3(0, dY, 0))
    }
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => {

  }

  private CreateMesh = () => {
    let geometry = new CylinderGeometry(1, 1, 0.01, this.faceCount)
    let verts = geometry.vertices
    let bottomCenterVect = verts[verts.length - 1]
    geometry.translate(0, -bottomCenterVect.y, 0)

    let materialConfig = {
      color: 0xaf6c15,
      side: FrontSide,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    }

    let lambertMaterial = new MeshLambertMaterial(materialConfig)

    let mesh = new Mesh(geometry, lambertMaterial)
    let { x, y, z } = this.growthLine.start
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.currentLength = 0.01
    this.currentGrowth.end.add(new Vector3(0, this.currentLength, 0))
    return mesh
  }

  private UpdateMesh = (length: Vector3, topRadius: number, bottomRadius: number) => {
    // Co-ordinates here are local to the geometry
    let meshGeometry = this.mesh.geometry as CylinderGeometry
    let verts = meshGeometry.vertices
    let centerTopVert = verts[verts.length - 2], centerBottomVert = verts[verts.length - 1]
    let cylinderCenterLine = centerTopVert.clone().sub(centerBottomVert)

    let topCircleVerts = verts.slice(0, this.faceCount)
    let bottomCircleVerts = verts.slice(this.faceCount, verts.length - 2)

    let dY = centerTopVert.clone().sub(length)
    let dθ = 2 * Math.PI / this.faceCount
    let rotAxis = new Vector3(0, 1, 0)
    topCircleVerts.forEach((vert, index) => {
      let tempVert = centerTopVert.clone().add(new Vector3(topRadius, 0, 0).add(dY))
      tempVert.applyAxisAngle(rotAxis, dθ * index)
      let { x, y, z } = tempVert
      vert.set(x, y, z)
    })
    centerTopVert.sub(dY)

    bottomCircleVerts.forEach((vert, index) => {
      let tempVert = centerBottomVert.clone().add(new Vector3(bottomRadius, 0, 0))
      tempVert.applyAxisAngle(rotAxis, dθ * index)
      let { x, y, z } = tempVert
      vert.set(x, y, z)
    })

    meshGeometry.verticesNeedUpdate = true
  }
}

export default InterNode
