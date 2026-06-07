export default function wallArea({map,$,i,j}) {
  if (map[i][j] === '*')
    $('#'+i+'-'+j).addClass('wall')
}