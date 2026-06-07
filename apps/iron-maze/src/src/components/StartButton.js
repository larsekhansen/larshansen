
export default function startbutton({map,$,i,j}) {
  if (map[i][j] === "S") {
    $("#" + i + "-" + j).addClass("start-btn")
    // Every corner of the start-button gets a different background-image
    if (map[i - 1][j] === "O" && map[i][j - 1] === "O")
      $("#"+i+"-"+j).addClass("nw-border")
    if (map[i - 1][j] === "O" && map[i][j + 1] === "O")
      $("#" + i + "-" + j).addClass("ne-border")
    if (map[i + 1][j] === "O" && map[i][j - 1] === "O")
      $("#" + i + "-" + j).addClass("sw-border")
    if (map[i + 1][j] === "O" && map[i][j + 1] === "O")
      $("#" + i + "-" + j).addClass("se-border")
  }
}