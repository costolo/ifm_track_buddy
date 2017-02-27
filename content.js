const TrackBuddy = function () {
  this.tracks = JSON.parse(window.localStorage.getItem('tracks')) || {
    main: [],
    disco: [],
    dream: [],
    garden: []
  }

  this.config = {
    attributes: true,
    childList: true,
    characterData: true
  }
}

async function callNowPlayingAPI () {
  let results
  let req = new window.Request('https://www.intergalactic.fm/ifm-system/playingnow.json')
  try {
    results = await window.fetch(req).then(res => res.json().then(json => json))
  } catch (err) {
    console.log(err)
    results = 'call failed'
  }
  return results
}

TrackBuddy.prototype.isNotDuplicate = function (track) {
  const that = this
  const lastTrackArr = [
    (() => that.tracks.main.length > 0 ? that.tracks.main[that.tracks.main.length - 1].track : undefined)(),
    (() => that.tracks.disco.length > 0 ? that.tracks.disco[that.tracks.disco.length - 1].track : undefined)(),
    (() => that.tracks.dream.length > 0 ? that.tracks.dream[that.tracks.dream.length - 1].track : undefined)(),
    (() => that.tracks.garden.length > 0 ? that.tracks.garden[that.tracks.garden.length - 1].track : undefined)()
  ]

  return lastTrackArr.indexOf(track) > -1
}

TrackBuddy.prototype.updateInterval = function () {
  const trackListUpdateInterval = window.setInterval(() => {
    callNowPlayingAPI()
      .catch(err => {
        window.clearInterval(trackListUpdateInterval)
        console.error(err)
        throw new Error(err)
      })
      .then(res => {
        if (res !== 'call failed') {
          this.sendTrackToBackground(res[1], 'main')
          this.sendTrackToBackground(res[2], 'disco')
          this.sendTrackToBackground(res[4], 'dream')
          this.sendTrackToBackground(res[5], 'garden')
        } else {
          window.clearInterval(trackListUpdateInterval)
        }
      })
  }, 15000)
}

TrackBuddy.prototype.sendTrackToBackground = function (trackObj, channel) {
  let track = {
    track: `${trackObj[0]} - ${trackObj[1]}`,
    time: formatDate(),
    faved: false
  }

  if (this.isNotDuplicate(track.track)) {
    switch (channel) {
      case 'main':
        this.tracks.main.push(track)
        break
      case 'disco':
        this.tracks.disco.push(track)
        break
      case 'dream':
        this.tracks.dream.push(track)
        break
      case 'garden':
        this.tracks.garden.push(track)
        break
    }

    window.localStorage.setItem('tracks', JSON.stringify(this.tracks))
    window.chrome.runtime.sendMessage({
      channel: channel,
      initialTracks: false,
      indvTrack: track
    }, null, () => {
      console.log('sent tracks to background')
    })
  }
}

const formatDate = () => {
  const date = new Date(Date.now())
  const intlDate = Intl.DateTimeFormat().format(date)
  const mins = date.getMinutes()
  const minutes = mins <= 9 ? '0' + mins : mins
  return `${intlDate}T${date.getHours()}:${minutes}`
}

const init = () => {
  const tb = new TrackBuddy()
  tb.updateInterval()

  window.chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if ((msg.from === 'popup') && (msg.subject === 'clicked')) {
      response(tb.tracks)
    }
  })

  window.chrome.runtime.sendMessage({
    initialTracks: true,
    tracks: tb.tracks
  }, null, () => {
    console.log('initial tracks sent')
  })
}

init()
