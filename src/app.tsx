import * as React from "react"
import * as ReactDOM from "react-dom"
import { AppContainer } from 'react-hot-loader'

import World from './flora/main'

import './index.html'

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <World />
    </AppContainer>,
    document.getElementById("root")
  )
}

if (module.hot) {
  module.hot.accept('./flora', () => {
    render()
  })
}

render()
