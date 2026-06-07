import $ from "jquery"

const fr = (coloredElement, string) => $(coloredElement).text(string)

let red = "<span class='hint-red'></span>"
let green = "<span class='hint-green'></span>"
let black = "<span class='hint-black'></span>"
let purple = "<span class='hint-purple'></span>"

let messages = [
  { // level 1
    "button": [
      fr(black,"Move your mouse through the maze. Don't touch "),
      fr(red,"the walls"),
      fr(black,"!"),
    ],
    "start": [],
    "death": {
      "enemy": [],
      "wall": [
        fr(black, "HAH. You "),
        fr(red, "lost. "),
        fr(black, "Try again? Just press "),
        fr(green, "the button.")
      ],
    },
  },
  { // level 2
    "button": [fr(black, "Watch out for those "), fr(purple,"pointer-eating snakes.") ],
    "start": [
      fr(black,"Oh, you actually made it? Wow. Well, you know "), 
      fr(green,"what to do.")
    ],
    "death": {
      "enemy": [
        fr(black, "You want to avoid "),
        fr(purple, "the pointer-eating snakes, "),
        fr(black, "mate. Try again"),
      ],
      "wall": [fr(red, "Really? The wall?")],
    },
  },
  { // level 3
    "button": [
      fr(black, "This dungeon hints at the "),
      fr(red, "evil curse "),
      fr(black, "that lurks here.")
    ],
    "start": [
      fr(black,"So. Uhm. Lucky you, its a safe zone! No enemies!")
    ],
    "death": {
      "enemy": [],
      "wall": [
        fr(black, "The iron-walls "),
        fr(red, "curse you with no free-time or social life!"),
        fr(black, " MWAHAHA!"),
      ],
    },
  },
]


export default messages