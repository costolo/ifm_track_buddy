window.chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg.initialTracks) {
    //appendTrack(msg.indvTrack, msg.channel)
  } else {
    window.chrome.pageAction.show(sender.tab.id)
  }
})

const appendTrack = (track, node) => {
  const targetNode = document.getElementById(node)
  const component = backgroundTrackComponent(track)
  targetNode.appendChild(component)
}

const backgroundTrackComponent = (track) => {
  console.log(track)
  const dateTimeArr = track.time.split('T')
  const container = document.createElement('li')
  const component = `<a href="https://www.google.com/#q=${track.track}">${track.track} @ ${dateTimeArr[1]}</a>`
  container.className = 'track'
  container.innerHTML = component
  return container
}

