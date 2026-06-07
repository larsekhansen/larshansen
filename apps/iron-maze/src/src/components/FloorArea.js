export default function floorArea ({map,$,i,j}) {
  if (map[i][j] === "O") {
    $("#" + i + "-" + j).addClass("game-area")

    // Adds borders between "wall" and "game-area"
    if (map[i][j - 1] === "*") $("#" + i + "-" + j).addClass("left-border")
    if (map[i][j + 1] === "*") $("#" + i + "-" + j).addClass("right-border")
    if (map[i - 1][j] === "*") $("#" + i + "-" + j).addClass("top-border")
    if (i < 19 && map[i + 1][j] === "*") $("#" + i + "-" + j).addClass("bottom-border")
  }
}