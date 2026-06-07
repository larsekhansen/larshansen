import $ from "jquery"
import toggleMusic from "./toggleMusic"
import hammertime from "../assets/audio/cant-touch-this.mp3"
import wallHit from "../assets/audio/wall-hit.wav"
import injectMessage from "../messages/injectMessages";

export default function injectEnemies(level) {
  if (level === 2) {
    const enemy = {}
    for(let i=1; i<=4; i++) {
      enemy[i] = `<div class='lvl2-snakes snake-pos-${i}'></div>`
      $(".gameboard").append(enemy[i])
    }
    $(".lvl2-snakes").hover(() => {
      if ($(".wall").hasClass("active")) {
        toggleMusic(hammertime)
        toggleMusic(wallHit)
        $(".wall").removeClass("active")
        injectMessage(level, "death", "enemy")
      }
    })
  }
}