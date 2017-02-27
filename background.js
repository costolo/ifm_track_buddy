window.chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg.initialTracks) {
    appendTrack(msg.indvTrack, msg.channel)
  } else {
    window.chrome.pageAction.show(sender.tab.id)
  }
})

const appendTrack = (track, node) => {
  const targetNode = document.getElementById(node).lastChild.querySelector('.dateContainer')
  const newTrackID = parseInt(targetNode.lastChild.dataset.id, 10) + 1
  const component = backgroundTrackComponent(track)
  component.dataset.id = newTrackID
  targetNode.appendChild(component)
}

const backgroundTrackComponent = (track) => {
  const dateTimeArr = track.time.split('T')
  const container = document.createElement('li')
  const component = `<a href="https://www.google.com/#q=${track.track}">${track.track} @ ${dateTimeArr[1]}</a>`
  container.className = 'track'
  container.innerHTML = component
  return container
}

