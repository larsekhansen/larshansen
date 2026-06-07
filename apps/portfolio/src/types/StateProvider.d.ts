export type GlobalStateType = {
  test: string
  setTest: React.Dispatch<React.SetStateAction<string>>
}

export interface StateProviderProps {
  children: React.ReactNode
}
