const buttonClickHandler = (button) => {
  if (!button.className.indexOf('buttonActive') >= 0) {
    const category = button.className.split(' ')[0]
    const activeEle = document.getElementsByClassName('active')[0]
    const newActiveEle = document.getElementById(category)
    const prevActiveButton = document.getElementsByClassName('buttonActive')[0]

    button.classList.toggle('buttonActive')
    prevActiveButton.classList.toggle('buttonActive')
    activeEle.classList.toggle('active')
    newActiveEle.classList.toggle('active')
  }
}

const dateContainerDivClickHandler = (div) => {
  const activeContainer = div.parentElement.querySelector('.open')
  const newContainer = div.children[0]

  activeContainer.classList.toggle('open')
  newContainer.classList.toggle('open')
}

const bindButtonEvents = () => {
  const buttons = document.getElementsByClassName('button')
  for (let x = 0, len = buttons.length; x < len; x++) {
    buttons[x].addEventListener('click', () => {
      buttonClickHandler(buttons[x])
    }, null)
  }
}

const bindDateContainerDivEvents = () => {
  const containers = document.getElementsByClassName('dateContainerDiv')
  for (let x = 0, len = containers.length; x < len; x++) {
    let cont = containers[x]
    cont.addEventListener('click', () => {
      dateContainerDivClickHandler(cont)
    })
  }
}

const appendAllTracks = (tracks) => {
  for (let trackList in tracks) {
    let targetNode = document.getElementById(trackList)
    for (let x = 0, len = tracks[trackList].length; x < len; ++x) {
      let currentTrack = tracks[trackList][x]
      let currentDate = currentTrack.time.split('T')[0]
      let component = trackComponent(currentTrack)
      let dateContainer
      appendDateContainer(currentTrack, targetNode)
      component.dataset.id = x
      dateContainer = targetNode.querySelector(`ul[data-date="${currentDate}"]`)
      if (x + 1 === len) dateContainer.classList += ' open'
      dateContainer.appendChild(component)
    }
  }
  bindDateContainerDivEvents()
}

const trackComponent = (track) => {
  const dateTimeArr = track.time.split('T')
  const container = document.createElement('li')
  const component = `<a href="https://www.google.com/#q=${track.track}">${track.track} @ ${dateTimeArr[1]}</a>`
  container.className = 'track'
  container.innerHTML = component
  return container
}

const appendDateContainer = (track, node) => {
  const date = track.time.split('T')[0]
  if (node.querySelector(`ul[data-date="${date}"]`) === null) {
    const dateContainerDiv = document.createElement('div')
    const dateContainer = document.createElement('ul')
    dateContainerDiv.innerText = date
    dateContainerDiv.className = 'dateContainerDiv'
    dateContainer.className = 'dateContainer'
    dateContainer.dataset.date = date
    dateContainerDiv.appendChild(dateContainer)
    node.appendChild(dateContainerDiv)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindButtonEvents()
  window.chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    window.chrome.tabs.sendMessage(
      tabs[0].id,
      {from: 'popup', subject: 'clicked'},
      appendAllTracks)
  })
})

