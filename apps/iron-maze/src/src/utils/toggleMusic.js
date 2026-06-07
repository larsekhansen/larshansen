
let songs = {}

//this function attempts to take in an audio file and play or pause it
function toggleMusic (file) {
  if (!file || typeof file !== "string")
    return console.warn("No working audio file.")
  let song = songs[file]
  if (!song) {
    song = new Audio(file)
    songs[file] = song
  }
  if (song.paused){
    song.load()
    song.play()
  }
  else song.pause()
  return console.log("DEBUG - song is", Boolean(!song.paused) ? "playing" : "paused")
}

export default toggleMusic