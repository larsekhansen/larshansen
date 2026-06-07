export default function finishZone({map,$,i,j}) {
  if (map[i][j] === 'F') {
    // Every corner of the finish-button also gets a different background-image
    $('#' + i + '-' + j).addClass('finish-btn')
    if (map[i - 1][j] === 'O' && map[i][j - 1] === 'O')
      $('#' + i + '-' + j).addClass('cartoon_grass_nw')
    if (map[i - 1][j] === 'O' && map[i][j + 1] === 'O')
      $('#' + i + '-' + j).addClass('cartoon_grass_ne')
    if (map[i + 1][j] === 'O' && map[i][j - 1] === 'O')
      $('#' + i + '-' + j).addClass('cartoon_grass_sw')
    if (map[i + 1][j] === 'O' && map[i][j + 1] === 'O')
      $('#' + i + '-' + j).addClass('cartoon_grass_se')
  }
}