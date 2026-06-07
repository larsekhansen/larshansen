import { useState } from "react"
import { Route, Routes } from "react-router-dom"
import About from "../About"
import CV from "../CV"
import Home from "../Home"
import { StyledNav, StyledLink } from "./Navbar-styles"

type useStateType = [number, React.Dispatch<React.SetStateAction<number>>]

const NavBar = () => {
  const pages = [
    { url: "/", text: "LARS HANSEN" },
    { url: "/about", text: "ABOUT" },
    { url: "/cv", text: "CV" },
  ]
  const [activePage, setActivePage]: useStateType = useState<number>(0)

  return (
    <>
      <StyledNav>
        {pages.map(({ url, text }, i) => (
          <StyledLink key={i} onClick={() => setActivePage(i)} $active={activePage === i} to={url}>
            {text}
          </StyledLink>
        ))}
      </StyledNav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/cv" element={<CV />} />
      </Routes>
    </>
  )
}

export default NavBar
