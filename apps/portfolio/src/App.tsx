import styled from "styled-components"
import NavBar from "./Components/Navbar/Navbar"

const AppContainer = styled.div`
  position: relative;
  text-align: center;
  height: 100%;
  min-height: 100vh;
`

const App = () => {
  return (
    <AppContainer>
      <NavBar />
    </AppContainer>
  )
}

export default App
