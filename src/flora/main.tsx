import * as React from "react"
import * as ReactDOM from "react-dom"
import styled from 'styled-components'
import SceneComposer from "../three/SceneComposer";
import Tree from "./tree/tree";

class World extends React.Component {
  testTree: Tree
  frameId: number
  mainComponent: HTMLHtmlElement
  canvas: HTMLCanvasElement
  sceneComposer: SceneComposer
  lastRenderTime: number

  constructor(props) {
    super(props)
  }

  async componentDidMount() {
    this.sceneComposer = new SceneComposer(this.canvas, this.mainComponent)
    await this.sceneComposer.InitialiseScene()
    window.addEventListener('resize', this.sceneComposer.OnWindowResize, false)

    this.testTree = new Tree()
    this.testTree.PrepareRender(this.sceneComposer.scene, 0)
    this.lastRenderTime = performance.now()
    this.frameId = requestAnimationFrame(this.animate)
    // setTimeout(this.logic, 1000)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.sceneComposer.OnWindowResize, false)
  }

  animate = () => {
    let timeNow = performance.now()
    let dt = timeNow - this.lastRenderTime
    this.testTree.PrepareRender(this.sceneComposer.scene, dt)
    this.sceneComposer.render()
    this.lastRenderTime = timeNow
    this.frameId = requestAnimationFrame(this.animate)
  }

  logic = () => {
    // Do Logic
    setTimeout(this.logic, 1000)
  }

  render() {
    return (
      <MainContentContainer innerRef={component => { this.mainComponent = component }} >
        <ThreeJsCanvas innerRef={canvasElement => this.canvas = canvasElement} />
      </MainContentContainer>
    )
  }
}

const MainContentContainer = styled.div`
  position: relative;
  height: 95vh;
  width: 95vw;
`

const ThreeJsCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
`

export default World
