import styled from "styled-components"
import { useShallow } from "zustand/shallow"
import useStore from "../store"

const HomeContainer = styled.div``

const Home = () => {
  const { myStateVariable, setMyStateVariable } = useStore(
    useShallow(state => ({
      myStateVariable: state.myStateVariable,
      setMyStateVariable: state.setMyStateVariable,
    })),
  )

  return (
    <HomeContainer>
      <h1>This is the Home page.</h1>
      <button onClick={setMyStateVariable}>{myStateVariable}</button>
    </HomeContainer>
  )
}

export default Home
