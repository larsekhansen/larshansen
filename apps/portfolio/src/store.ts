import { create } from "zustand"

type State = {
  myStateVariable: string
  setMyStateVariable: () => void
  removeMyStateVariable: () => void
  userPaymentId: string
  setUserPaymentId: (userPaymentId: string) => void
}

const useStore = create<State>(set => ({
  myStateVariable: "hello world",
  setMyStateVariable: () =>
    set(state => ({
      myStateVariable: state.myStateVariable === "hello world" ? "hello, world!" : "hello world",
    })),
  removeMyStateVariable: () => set({ myStateVariable: "" }),
  userPaymentId: "",
  setUserPaymentId: (userPaymentId: string) => set({ userPaymentId }),
}))

export default useStore
