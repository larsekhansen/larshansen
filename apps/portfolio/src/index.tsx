import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import GlobalStyles, { Theme } from "./GlobalStyles"
import App from "./App"
import { StateProvider } from "./StateProvider"
import { BrowserRouter } from "react-router-dom"

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <StrictMode>
    <GlobalStyles />
    <Theme>
      <StateProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StateProvider>
    </Theme>
  </StrictMode>,
)
