import * as THREE from 'three'

class Terrain {
  constructor() {}

  GenerateTerrainMesh(): THREE.Mesh {
    var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8)
    let material = new THREE.MeshLambertMaterial({
      color: 0x000F00,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.5
      // wireframe: true
    })
    var plane = new THREE.Mesh(geo, material)
    plane.rotateX(-Math.PI / 2)
    plane.castShadow = false
    plane.receiveShadow = true

    return plane
  }
}

export default Terrain
