import type { ReactNode } from "react"
import { createGlobalStyle, ThemeProvider } from "styled-components"

/** color theme **/

export enum theme {
  navBarBG = "#FAF9F9",
  mintCream = "#f7fff7",
  naplesYellow = "#ffe66d",
  turquoise = "#4ecdc4",
  salmonPink = "#ff6b6b",
  midnightGreen = "#1a535c",
  navBarText = "#555B6E",
}

interface Props {
  children: ReactNode
}

export const Theme = (props: Props) => {
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
}

/** Global style **/

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    min-height: 100%;
  }
  
  body {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: ${theme.mintCream};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

export default GlobalStyle
