import * as React from "react"
import * as ReactDOM from "react-dom"
import styled from 'styled-components'
import SceneComposer from "../three/SceneComposer";

class World extends React.Component {
  frameId: number
  mainComponent: HTMLHtmlElement
  canvas: HTMLCanvasElement
  sceneComposer: SceneComposer

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.sceneComposer = new SceneComposer(this.canvas, this.mainComponent)
    this.sceneComposer.InitialiseScene()
    window.addEventListener('resize', this.sceneComposer.OnWindowResize, false)

    this.frameId = requestAnimationFrame(this.animate)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.sceneComposer.OnWindowResize, false)
  }

  animate = () => {
    this.sceneComposer.render()
    this.frameId = requestAnimationFrame(this.animate)
  }

  logic = () => {

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
