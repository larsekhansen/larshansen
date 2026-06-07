import { createContext, useContext, useState } from "react"
import { GlobalStateType, StateProviderProps } from "./types/StateProvider"

export const GlobalState = createContext<Partial<GlobalStateType>>({})

export const StateProvider = (props: StateProviderProps) => {
  const [test, setTest] = useState("one-two")

  const state = {
    test,
    setTest,
  }

  return <GlobalState.Provider value={state}>{props.children}</GlobalState.Provider>
}

const useGlobalState = (): Partial<GlobalStateType> => useContext(GlobalState)

export default useGlobalState

/* usage
1 useGlobalState-hook:
    import { useGlobalState } from "~/StateProvider"
    ...
    const { myState, setMyState } = useGlobalState()
2 Used grainy
    import { useGlobalState } from "~/StateProvider"
    import { useContext } from "react"

    useContext(GlobalState) 
*/
