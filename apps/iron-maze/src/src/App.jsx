import finalLevelWin from "./assets/audio/final-level-win.wav"
import hammertime from "./assets/audio/cant-touch-this.mp3"
import maps from "./utils/maps"
import injectMessage from "./messages/injectMessages"
import teleport from "./assets/audio/teleport.wav"
import startButton from "./components/StartButton"
import injectEnemies from "./utils/injectEnemies"
import wallHit from "./assets/audio/wall-hit.wav"
import finishZone from "./components/FinishZone"
import floorArea from "./components/FloorArea"
import toggleMusic from "./utils/toggleMusic"
import wallArea from "./components/WallArea"
import React from "react"
import $ from "jquery"
import "./style.css"


class Game extends React.Component {
  level = 0
  nextLevel = () => {
    let { level } = this
    let { mapOne, mapTwo, mapThree } = maps
    let curMap = [mapOne, mapTwo, mapThree][level]
    level++
    this.makeMap(curMap, level)
    this.startLevelListener()
    this.loseLevelListener()
    this.winLevelListener()
    injectEnemies(level)
    injectMessage(level, "start")
    if (level > 3) toggleMusic(finalLevelWin)
  }

  startLevelListener = () => {
    $(".start-btn").click(() => {
      $(".wall").addClass("active")
      toggleMusic(hammertime)
      injectMessage(this.level, "button")
    })
    $(".start-btn").mousedown(() => $(".start-btn").toggleClass("clicked"))
    $(".start-btn").mouseup(() => $(".start-btn").toggleClass("clicked"))
  }

  loseLevelListener = () => {
    $(".wall").hover(() => {
      if ($(".wall").hasClass("active")) {
        $(".wall").removeClass("active")
        toggleMusic(hammertime)
        toggleMusic(wallHit)
        injectMessage(this.level, "death", "wall")
      }
    })
  }

  winLevelListener = () => {
    $(".finish-btn").hover(() => {
      if ($(".wall").hasClass("active")) {
        $(".wall").removeClass("active")
        toggleMusic(hammertime)
        toggleMusic(teleport)
        if (this.level === 3) {
          toggleMusic(finalLevelWin)
          $(".hint").text("You. You are a champion. You deserve this win.")
          .css({"color": "gold", "text-align": "center", "text-shadow": "2px 2px black"})
        }
        this.nextLevel()
      }
    })
  }

  makeMap = (map, level) => {
    this.level = level
    $(".gameboard").empty()
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 32; j++) {
        let cellDiv = $("<div id='" + i + "-" + j + "' class='cell'></div>")
        const data = { map, i, j, $, }
        $(".gameboard").append(cellDiv)
        floorArea(data)
        wallArea(data)
        startButton(data)
        finishZone(data)
      }
    }
  }

  componentDidUpdate() {
    console.log("componentDidUpdate")
  }

  componentDidMount() {
    this.makeMap(maps.mapOne, 1)
    this.startLevelListener()
    this.loseLevelListener()
    this.winLevelListener()
  }

  render() {
    return (
      <div className="game-page">
        <h1 id="game-heading">The Mouse Maze</h1>
        <div className="gameboard"/>
        <p className="hint">Click the green button to start the game!</p>
      </div>
    )
  }
}

export default Game
