import IGrowable from "./IGrowable"
import IRenderable from "./IRenderable"

abstract class Flora implements IGrowable, IRenderable {
  ProcessLogic = () => { console.error('Must override ProcessLogic') }
  PrepareRender = (scene, deltaTime) => { console.error('Must override PrepareRender') }
}

export default Flora
