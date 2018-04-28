import * as THREE from 'three'

class Sky {
  constructor() { }

  GenerateSkyMesh = (): Promise<THREE.Mesh> => {
    let skyGeo = new THREE.SphereGeometry(5000, 25, 25)
    let loader = new THREE.TextureLoader()
    let skyboxPromise = new Promise<THREE.Mesh>((resolve, reject) => {
      loader.load(
        '../../images/skybox1.jpg',
        texture => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.anisotropy = 4;
          texture.repeat.set(1, 1);
          let material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide // THREE.BackSide?
          })
          let sky = new THREE.Mesh(skyGeo, material)
          resolve(sky)
        },
        progress => {
          console.info(`Texture Loading Progress: ${progress}`)
        },
        error => {
          console.error(error)
          reject(error)
        }
      )
    })
    return skyboxPromise
  }
}

export default Sky
