import * as THREE from 'three'
import Terrain from './Terrain';

class SceneComposer {
  terrain: Terrain
  cameraConfig: { fov: number; viewWidth: number; viewHeight: number; aspectRatio: number; nearPlane: number; farPlane: number; }
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  attachedElement: HTMLElement

  constructor(canvas: HTMLCanvasElement, parent: HTMLHtmlElement) {
    this.cameraConfig = {
      fov: 75,
      viewWidth: parent.clientWidth,
      viewHeight: parent.clientHeight,
      aspectRatio: parent.clientWidth / parent.clientHeight,
      nearPlane: 0.1,
      farPlane: 10000
    }
    let { fov, aspectRatio, nearPlane, farPlane } = this.cameraConfig

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane)
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    })

    this.setupRenderer()
  }

  private setupRenderer = () => {
    let { viewWidth, viewHeight } = this.cameraConfig
    this.renderer.setSize(viewWidth, viewHeight)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  OnWindowResize = () => {
    console.log(`Window is Resizing... New dimentions: W=${window.innerWidth} H=${window.innerHeight}`)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  InitialiseScene = async () => {
    let axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)

    this.terrain = new Terrain()
    this.scene.add(this.terrain.GenerateTerrainMesh())

    this.camera.position.set(5, 15, 30)
    this.camera.lookAt(new THREE.Vector3(5, 5, 5))
    this.scene.add(this.camera)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}

export default SceneComposer
