import * as THREE from 'three'
import Terrain from './Terrain';
import Sky from './Sky';

class SceneComposer {
  sun: THREE.DirectionalLight
  sky: Sky
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

    this.sky = new Sky()
    let skyMesh = await this.sky.GenerateSkyMesh()
    this.scene.add(skyMesh)

    this.terrain = new Terrain()
    this.scene.add(this.terrain.GenerateTerrainMesh())

    let hemiLight = new THREE.HemisphereLight(0x0000ff, 0xffffff, 1)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    this.sun = new THREE.DirectionalLight(0xffffff, 2)
    this.sun.position.set(-25, 200, 150)
    this.sun.lookAt(new THREE.Vector3())
    this.sun.castShadow = true
    this.sun.shadow.mapSize.width = 512
    this.sun.shadow.mapSize.height = 512
    this.sun.shadow.camera = new THREE.OrthographicCamera(-1000,1000,1000,-1000,0,1000)
    this.scene.add(this.sun)

    this.camera.position.set(5, 15, 5)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.camera)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}

export default SceneComposer
