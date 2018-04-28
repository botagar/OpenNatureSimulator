interface IRenderable {
  PrepareRender: (scene: THREE.Scene, timeDelta?: number) => void  
}

export default IRenderable
