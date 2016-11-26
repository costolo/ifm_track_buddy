const TrackBuddy = function () {
  this.tracks = JSON.parse(window.localStorage.getItem('tracks')) || {
    main: [],
    disco: [],
    dream: []
  }

  this.config = {
    attributes: true,
    childList: true,
    characterData: true
  }

  this.mainNode = document.getElementById('c-1')
  this.discoNode = document.getElementById('c-2')
  this.dreamNode = document.getElementById('c-4')
}

TrackBuddy.prototype.instantiateObserver = function (node, trackArr, channel) {
  const observer = new window.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      let currentTrackTitle = mutation.addedNodes[2].innerText
      let lastTrackTitle = trackArr.length > 0 ? trackArr[trackArr.length - 1].track : undefined
      if (currentTrackTitle !== lastTrackTitle) {
        let track = {
          track: currentTrackTitle,
          time: formatDate(),
          faved: false
        }
        trackArr.push(track)
        window.localStorage.setItem('tracks', JSON.stringify(this.tracks))
        window.chrome.runtime.sendMessage({
          channel: channel,
          initialTracks: false,
          indvTrack: track
        }, null, () => {
          console.log('sent tracks to background')
        })
      }
    })
  })
  observer.observe(node, this.config)
}

const formatDate = () => {
  const date = new Date(Date.now())
  const intlDate = Intl.DateTimeFormat().format(date)
  const mins = date.getMinutes()
  const minutes = mins <= 9 ? '0' + mins : mins
  return `${intlDate}T${date.getHours()}:${minutes}`
}

const init = (() => {
  const ts = new TrackBuddy()
  ts.instantiateObserver(ts.mainNode, ts.tracks.main, 'main')
  ts.instantiateObserver(ts.discoNode, ts.tracks.disco, 'disco')
  ts.instantiateObserver(ts.dreamNode, ts.tracks.dream, 'dream')

  window.chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if ((msg.from === 'popup') && (msg.subject === 'clicked')) {
      response(ts.tracks)
    }
  })

  window.chrome.runtime.sendMessage({
    initialTracks: true,
    tracks: ts.tracks
  }, null, () => {
    console.log('initial tracks sent')
  })
})()
