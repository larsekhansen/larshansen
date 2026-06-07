export function messageFailure(level, event, messages) {
  return console.warn(`FAILED to add message with params (${level}, ${event}). Available InjectMessage params:`
  + Object.keys(messages[0])
  .reduce((sum, key) => {
    console.log('DEBUG - typeof key === object && key !== null && Object.keys(key).length', typeof key === 'object' && key !== null && Object.keys(key).length)
    console.log('DEBUG - typeof key', typeof key)
    console.log('DEBUG - key !== null', key !== null)
    console.log('DEBUG - key', Object.keys(key).length>1)
    console.log('DEBUG - key, event', key, event)
    if (typeof key === 'object' && key !== null && Object.keys(key).length) { //if there are embedded objects
      key = Object.keys(key)
      .reduce((sum, cur, i) => {
        console.log("2nd",sum, cur, i)
        return sum + i === 0 
          ? `${key}.${cur}, ` 
          : `${key}.${cur}` }, "")
    }
    return sum+", "+key
  }))
}

