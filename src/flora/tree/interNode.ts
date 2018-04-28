import IGrowable from "../common/IGrowable"
import IRenderable from "../common/IRenderable"
import { Scene, CylinderGeometry, Line3, FrontSide, MeshLambertMaterial, Mesh, Geometry, Vector3 } from "three"

class InterNode implements IGrowable, IRenderable {
  maxLength: number
  isAtMaxLength: boolean
  timeScale: number
  faceCount: number
  mesh: Mesh
  isInScene: boolean
  growthLine: Line3
  currentLength: number

  constructor(growthLine: Line3, timeScale: number, faceCount: number) {
    this.growthLine = growthLine
    this.timeScale = timeScale
    this.faceCount = faceCount
    this.maxLength = growthLine.distance()
    this.isAtMaxLength = false
  }

  PrepareRender = (scene: Scene, dt: number) => {
    if (!this.mesh) this.mesh = this.CreateMesh()
    if (this.isAtMaxLength) return null
    if (this.currentLength >= this.maxLength) {
      this.isAtMaxLength = true
      return null
    }
    if (dt) {
      let dY = (this.growthLine.distance() / this.timeScale) * (dt / 1000)
      let desiredLength = new Vector3(0, this.currentLength + dY, 0)
      this.UpdateMesh(desiredLength, 1, 1)
      this.currentLength += dY
    }
    if (this.isInScene) return null
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic = () => {

  }

  private CreateMesh = () => {
    let geometry = new CylinderGeometry(1, 1, 1, this.faceCount)
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
    this.currentLength = 1
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
      // vert.sub(dY)
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