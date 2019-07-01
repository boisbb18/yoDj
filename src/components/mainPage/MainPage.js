import React from 'react'
import {BrowserRouter, Switch, Redirect, Route, withRouter} from 'react-router-dom'
import firebase from 'firebase'
import {MuiThemeProvider} from '@material-ui/core/styles'
import axios from 'axios'
import theme from 'src/config/CustomStyle'
import HomePage from '../homepage'
import LoginWrapper from '../loginWrapper'
import {fire} from 'src/config/Fire'
import NewEventWrapper from '../newEventWrapper'
import AcceptWrapper from '../acceptWrapper'
import EventView from '../eventView'
import FeedPage from '../feedPage'
import FanHomepage from '../fanHomepage'
import SelectDj from '../selectDJ'
import FanEvent from '../fanEvent'
import TippingPage from '../tippingPage'

class MainPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLogged: false,
      userId: '',
      userInfo: {},
      event: {},
      isActive: false,
      newRequest: {},
      requests: [],
      allDjs: [],
      fanEvent: {},
      joined: false,
      activities: [],
      fans: [],
      acceptedSongs: []
    }
    this.authListener = this.authListener.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.logoutUser = this.logoutUser.bind(this)
    this.finishEvent = this.finishEvent.bind(this)
    this.goBackHome = this.goBackHome.bind(this)
    this.addRequestToFirebase = this.addRequestToFirebase.bind(this)
    this.getDjs = this.getDjs.bind(this)
    this.goFanPage = this.goFanPage.bind(this)
    this.addFanEvent = this.addFanEvent.bind(this)
    this.joinEvent = this.joinEvent.bind(this)
    this.getEvent = this.getEvent.bind(this)
    this.leaveEvent = this.leaveEvent.bind(this)
    this.submitSongRequest = this.submitSongRequest.bind(this)
    this.getDjEvent = this.getDjEvent.bind(this)
    this.updateActivities = this.updateActivities.bind(this)
    this.updateRequests = this.updateRequests.bind(this)
    this.getFans = this.getFans.bind(this)
    this.acceptingSong = this.acceptingSong.bind(this)
    this.updateAcceptedSongs = this.updateAcceptedSongs.bind(this)
    this.openDeliveryPage = this.openDeliveryPage.bind(this)
    this.rejectRequest = this.rejectRequest.bind(this)
  }

  componentDidMount() {
    this.authListener()
  }

  componentDidUpdate(prevProps, prevState) {
    let {location} = this.props
      if (location.pathname === '/event' &&  Object.keys(this.state.event).length === 0)
      {
        this.props.history.push('/home')
        return
      }

      if (location.pathname !== '/fan-tip' && this.state.joined && Object.keys(this.state.fanEvent).length !== 0 && this.state.allDjs !== 0) {
        this.props.history.push('/fan-tip')
        return
      }

      if (Object.keys(this.state.fanEvent).length === 0 && location.pathname === '/fan-event') {
        this.props.history.push('/fan-home')
        return
      }

      if (prevProps.location.state && location.pathname ==='/new-event' && Object.keys(this.state.newRequest).length === 0) {
        this.props.history.push('/home')
        this.setState({
          newRequest: {}
        })
        return
      }

      if (location.pathname ==='/accept-request' && location.state && (!this.state.newRequest.id || (this.state.newRequest.id !== location.state.request.id))) {
        this.setState({
          newRequest: location.state.request
        }, () => {
          this.props.history.push('/accept-request')
        })
        return
      }

      if (location.pathname === '/accept-request' && !location.state && (!this.state.newRequest.id && this.state.acceptedSongs.length > 0)) {
        this.setState({
          newRequest: {...this.state.acceptedSongs[0], accepted: true}
        }, () => {
          this.props.history.push('/accept-request')
        })
      }

      if ((prevProps.location.state  || !prevProps.location.state) && location.pathname ==='/feed' &&  this.state.requests.length === 0 && (!location.state || (location.state && location.state.requests === 0))) {
        this.props.history.push('/home')
        this.setState({
          requests: []
        })
        return
      }

      if (this.state.requests.length === 0 && location.pathname === '/feed' && location.state && location.state.requests) {
        this.setState({
          requests: location.state.requests
        })
        return
      }

      if (this.state.requests.length !== 0 && location.pathname === '/feed' && location.state && location.state.deletingRequest) {
        let requests = this.state.requests.filter(request => request.id !== location.state.deletingRequest.id)
        this.setState({
          requests
        }, () => {
          this.props.history.push('/home')
        })
        return
      }

      if (Object.keys(this.state.fanEvent).length === 0 && location.pathname === '/fan-tip') {
        this.props.history.push('/fan-home')
        this.setState({
          joined: false
        })
        return
      }
  }

  authListener() {
    fire.auth().onAuthStateChanged(user => {
      if (user) {
        if (this.state.userID !== '') {
          this.setState({
            isLogged: true,
            userId: user.uid
          })
        }
        this.getUserInfo(user.uid)
      }
      else {
        this.logoutUser()
      }
    })
  }

  logoutUser() {
    console.log('Logout')
    fire.auth().signOut()
    .then(() => {
      this.setState({
        isLogged: false,
        userId: '',
        userInfo: {}
      })
      this.props.history.push('/login')
    })
  }

  getDjs() {
    firebase.database()
      .ref('users')
      .on('value', snapshot => {
        let data = snapshot.val()
        if (data) {
          let allDjs = Object.values(data).reduce((acc, user) => {
            if (!user.userType && user.userType !== 'Fan') {
              acc.push(user)
            }
            return acc
          },[])
          this.setState({
            allDjs
          })
        }
      })
  }


  getFans() {
    firebase.database()
    .ref('users')
    .on('value', snapshot => {
      let data = snapshot.val()
      if (data) {
        let fans = Object.values(data).reduce((acc, user) => {
          if (user.userType && user.userType === 'Fan') {
            acc[user.userId] = user
          }
          return acc
        },{})
        this.setState({
          fans
        })
      }
    })
  }

 getEvent(venue) {
   firebase.database().ref(`/venues/${venue}`).on('value', snapshot => {
     if (snapshot.val()) {
       this.setState({
          fanEvent: {...snapshot.val(), fanId: venue}
       })
     }
   })

  }

  updateActivities(joined = {}, eventUpdated) {
    let {activities, requests, fans, event} = this.state
    let joinedArr = Object.keys(joined)
    let lastJoiner = joinedArr.length > 0 ? joinedArr[0] : joinedArr[joinedArr.length ]
    let requestsArr = requests.map(request => request.id)
    let now = new Date()
    now = now.getTime()
    if (activities.length === 0 && Object.keys(fans).length !== 0) {
      joinedArr.forEach(user => {
        if (fans[user]) {
          activities.push(user)
          requests.unshift({name: fans[user].username, songRequest: false, id: user, message: 'joined your event', img: fans[user].imageUrl, time: now})
        }
      })
    }

    else if (activities.length > joinedArr.length) {
      let leftUsers = []
      activities = activities.filter(user => {
        if (joinedArr.indexOf(user) === -1 ) {
          leftUsers.push(user)
          requests.unshift({name: fans[user].username, songRequest: false, id: user, message: 'left your event', img: fans[user].imageUrl, time: now})
        }
        else {
          return user
        }
      })
      let findIds = []
      leftUsers.forEach(user => {
        findIds = requests.filter(req => (req.songRequest && req.fanId === user))
      })
      this.setState({
        activities, requests, event: eventUpdated
      }, () => {
        findIds.forEach(request => {
          firebase.database().ref(`venues/${event.eventId}/requests/${request.id}`).remove()
        })
      })
    }

   else if (activities[activities.length - 1] !== lastJoiner && fans[lastJoiner]) {
      activities.push(lastJoiner)
      requests.unshift({name: fans[lastJoiner].username, songRequest: false, id: lastJoiner, message: 'joined your event', img: fans[lastJoiner].imageUrl, time: now})
    }
    this.setState({
      activities, requests
    })
  }

  updateRequests(requested) {
    let {requests, fans, activities} = this.state
    let requestIds = requests.map(request => request.id)
    let requestedArr = Object.keys(requested)
    let songsArr = Object.values(requested)
    let lastAdded = requestedArr[requestedArr.length - 1]
    let requestedUser = requestedArr.length > 0 ? fans[requested[lastAdded].user] : ''
    let songRequests = requests.length - activities.length
    if (requestedArr.length === 0) {
      requests = requests.filter(req => !req.songRequest)
      this.setState({
        requests
      })
    }
    else if (requestedArr.length === 0) {
      requests = requests.filter(request => {
        if (!request.songRequest) {
          return request
        }
      })
    }
    else if (requestedArr.length > 0 && songRequests === 0) {
     songsArr.forEach((request, idx) => {
       if (fans[request.user]) {
         requests.unshift({name: fans[request.user].username, songRequest: true, id: request.requestId, song: request.music, tip: request.tipAmount, time: request.time, img: fans[request.user].imageUrl, fanId: request.user})
       }
      })
    }
   else if (requestedArr.length < songRequests) {
     requests = requests.filter(request => {
       if (!request.songRequest) {
         return request
       }
       if (request.songRequest && requestedArr.indexOf(request.id) !== -1 && requestedArr.length > 0) {
         return request
       }
     })
   }
   else if (requestIds.indexOf(lastAdded) === -1) {
     requests.unshift({name: requestedUser.username, songRequest: true, id: lastAdded, song: requested[lastAdded].music, tip: requested[lastAdded].tipAmount, time: requested[lastAdded].time, img: requestedUser.imageUrl, fanId: lastAdded.user})
    }
    this.setState({
      requests
    })
  }

  updateAcceptedSongs(pendingSongs = {}) {
    let {requests, fans, activities, acceptedSongs} = this.state
    let acceptedIds = acceptedSongs.map(song => song.id)
    let pendingIds = Object.keys(pendingSongs)
    let pendingSongArr = Object.values(pendingSongs)
    if (pendingIds.length === 0) {
      acceptedSongs = []
    } else if (acceptedSongs.length > pendingSongArr.length) {
      acceptedSongs = acceptedSongs.filter(song => {
        if (pendingIds.indexOf(song.id) !== -1) {
          return song
        }
      })
    } else if (acceptedSongs.length === 0 && pendingIds.length > 0) {
      pendingSongArr.forEach((request, idx) => {
          acceptedSongs.push({name: request.name, songRequest: true, id: request.id, song: request.song, tip: request.tip, time: request.time, img: request.img, accepted: true})
      })
    } else if (acceptedIds.indexOf(pendingIds[pendingIds.length - 1]) === -1) {
      let lastRequest = pendingSongArr[pendingSongArr.length - 1]
        acceptedSongs.push({name: lastRequest.name, songRequest: true, id: lastRequest.id, song: lastRequest.song, tip: lastRequest.tip, time: lastRequest.time, img: lastRequest.img, accepted: true})
    }
    this.setState({
      acceptedSongs
    })
  }

  getDjEvent(venue, uid) {
    firebase.database().ref(`/venues/${venue}`).on('value', snapshot => {
      let event = snapshot.val()
      if (event) {
        event.eventId = venue
        let {activities, requests, acceptedSongs} = this.state
        let songRequests = requests.length - activities.length
        let isActive = false
        let wholeDay = new Date(event.startDate).getTime() +(24 * 60 * 60 * 1000)
        let isDayOld = new Date().getTime() >= wholeDay
        if (isDayOld) {
          let joiners = event.joiners ? Object.keys(event.joiners) : []
          this.setState({
            event,
            activities: joiners
          }, () => {
            this.finishEvent()
          })
          return
        }
        if (Object.keys(event).length === 0 && this.props.location.pathname === '/event') {
          this.props.history.push('/home')
        }
        if (Object.keys(event).length !==0 ) {
          isActive = true
        }
        if (event.joiners || this.state.activities.length > 0) {
          let joiners = event.joiners ? event.joiners : {}
          this.updateActivities(joiners, event)
        }
        if (event.requests || songRequests !== 0) {

          let newSongRequests = event.requests ? event.requests : {}
          this.updateRequests(newSongRequests)
        }

        if (event.pending || acceptedSongs.length !== 0) {
          let allAccepted = event.pending ? event.pending  : {}
          this.updateAcceptedSongs(allAccepted)
        }

        this.setState({
          event,
          isActive
        })
      }
    })
  }

  getUserInfo(userId) {
    let uid = this.state.userId === '' ? userId : this.state.userId
    firebase.database()
      .ref(`users/${uid}`)
      .on('value',snapshot => {
        let data = snapshot.val()
        if (data) {
          if (data.userType && data.userType === 'Fan') {
            let userInfo = {username: data.username, type: 'fan', phone: data.phone, imageUrl: data.imageUrl, venue: data.venue}
            let joined = data.venue ? true : false
            let fanEvent = {}
            this.setState({
              userInfo,
              joined
            }, () => {
              this.getDjs()
              if (data.venue) {
                this.getEvent(data.venue.id)
              }
            })
            return
          }
          let userInfo = {imageUrl: data.imageUrl, name: data.name}
          let isActive = false
          let {event} = data
          this.setState({
            userInfo
          }, () => {
            this.getFans()
            if (event && event.requestId) {
              this.getDjEvent(event.requestId, uid)
            }
          })
        } else {
          this.props.history.push('/login')
        }
      })
  }

  addRequestToFirebase(request) {
    let {userId, requests, newRequest, fans, event, acceptedSongs} = this.state
    let now = new Date().getTime()
    request.completedTime = now
    firebase.database().ref(`venues/${event.eventId}/completed/${request.id}`).set(request, error => {
      if (!error) {
        let index = acceptedSongs.map(req => req.id).indexOf(request.id)
        index = acceptedSongs.length - 1 > index ? index + 1 : (index !== 0 && acceptedSongs.length > 1) ? 0 : -1
        if (index !== -1) {
          newRequest = {...acceptedSongs[index]}
        }
        firebase.database().ref(`venues/${event.eventId}/pending/${request.id}`).remove()
        firebase.database().ref(`users/${request.fanId}/venue/completed/${request.id}`).set(request)
      }
    })
  }

  finishEvent() {
    let {userId, event, activities} = this.state
    firebase.database().ref(`users/${userId}/event`).remove()
    firebase.database().ref(`venues/${event.eventId}`).remove()
    activities.forEach(user => {
      firebase.database().ref(`users/${user}/venue`).once('value').then(snapshot => {
      let completedEvent = snapshot.val()
      let userRequests = completedEvent.requests ? completedEvent.requests : {requests: 0}
      firebase.database().ref(`users/${user}/completed/${completedEvent.id}`).set(userRequests)
      firebase.database().ref(`users/${user}/venue`).remove()
      })
    })
    this.setState({
      isActive: false,
      event: {}
    }, () => {
      this.props.history.push('/home')
    })
  }

  goBackHome() {
    this.props.history.push('/home')
  }

  goFanPage() {
    this.props.history.push('/fan-home')
  }

  addFanEvent(fanEvent) {
    this.setState({
      fanEvent
    }, () => {
      this.props.history.push('/fan-event')
    })
  }

  openDeliveryPage() {
    let {acceptedSongs, newRequest} = this.state
    if (acceptedSongs.length > 0) {
      this.setState({
        newRequest: acceptedSongs[0]
      }, () => {
        this.props.history.push('/accept-request')
      })
    }
  }

  acceptingSong(request) {
    let {event, acceptedSongs, requests, newRequest} = this.state
    request.tipAmount = request.tip
    firebase.database().ref(`venues/${event.eventId}/pending/${request.id}`).set(request, error => {
      if (!error) {
        let index = requests.map(req => req.id).indexOf(request.id)
        if (index !== -1) {
          requests.splice(index, 1)
        }
        newRequest = {...request, accepted: true}
        firebase.database().ref(`venues/${event.eventId}/requests/${request.id}`).remove()
        this.setState({
          acceptedSongs, requests, newRequest
        }, () => {
          this.props.history.push('/accept-request')
        })
      }
    })
  }

  joinEvent(venue) {
    let {event} = venue
    let {userId, userInfo} = this.state
    firebase.database().ref(`venues/${event.requestId}/joiners/${userId}`).set(true)
    firebase.database().ref(`users/${userId}/venue/id`).set(event.requestId)
    this.setState({
      join: true
    })
  }

  leaveEvent() {
    let {fanEvent, userInfo, userId} = this.state
    firebase.database().ref(`venues/${fanEvent.fanId}/joiners/${userId}`).remove()
    firebase.database().ref(`users/${userId}/venue`).remove()
    this.setState({
      fanEvent: {}
    }, () => {
      this.props.history.push('/fan-home')
    })
  }

  rejectRequest(request) {
    let {event, acceptedSongs, requests, newRequest, userId} = this.state
      firebase.database().ref(`venues/${event.eventId}/requests/${request.id}`).remove()
      firebase.database().ref(`users/${request.fanId}/venue/requests/${request.id}`).remove()
  }

  submitSongRequest(info) {
    // let {fanEvent, userId, userInfo} = this.state
    // let now = new Date().getTime()
    // let request = {...info, user: userId, time: now}
    // let myRef = firebase.database().ref(`venues/${fanEvent.fanId}/requests`)
    // let key = myRef.push().key
    // request.requestId = key
    // myRef.child(`/${key}`).set(request)
    // firebase.database().ref(`users/${userId}/venue/requests/${key}`).set(true, error => {
    //   if (!error) {
    //     console.log('Its added to firebase')
    //   }
    // })
    axios.get('http://localhost:8080/login')
      .then(res => console.log('RES ---> ', res))
      .catch(err => console.log('Err ---> ', err))
  }

  render() {
    let {userInfo, userId, event, newRequest, requests, isActive, allDjs, fanEvent, acceptedSongs} = this.state
    return(
      <MuiThemeProvider theme={theme}>
        <div className="MainPage">
          <Switch>
              <Route path="/new-event" render={props => (<NewEventWrapper userInfo={userInfo} userId={userId} onLogout={this.logoutUser}/>)} />
              <Route path="/event" render={props => (<EventView userInfo={userInfo} userId={userId} event={event} onFinish={this.finishEvent}  onLogout={this.logoutUser} />)}/>
              <Route path="/home" render={props =>
                (
                  <HomePage
                    userInfo={userInfo}
                    userId={userId}
                    event={event}
                    requests={requests}
                    onLogout={this.logoutUser}
                    onFinish={this.finishEvent}
                    isActive={isActive}
                    acceptedSongs={acceptedSongs}
                    onDeliver={this.openDeliveryPage}
                    onReject={this.rejectRequest}
                  />
                )} />
              <Route path="/fan-home" render={props =>
                (
                <FanHomepage
                  userInfo={userInfo}
                  userId={userId}
                  event={event}
                  onLogout={this.logoutUser}
                  djs={allDjs}
                  onFanSelect={this.addFanEvent}
                  />
                )}/>
              <Route path="/feed" render={props =>
                (<FeedPage
                  userInfo={userInfo}
                  isActive={this.state.isActive}
                  requests={requests}
                  onGoBack={this.goBackHome}
                  onLogout={this.logoutUser}
                  />)} />
              <Route path='/accept-request' render={props =>
                  (<AcceptWrapper
                    userInfo={userInfo}
                    isActive={isActive}
                    onLogout={this.logoutUser}
                    onGoBack={this.goBackHome}
                    request={newRequest}
                    onAccepted={this.acceptingSong}
                    onAddRequest={this.addRequestToFirebase}
                  />)} />
              <Route path="/login" render={props => (<LoginWrapper />)} />
              <Route path="/dj-page" render={props => (
                <SelectDj
                  userInfo={userInfo}
                  onLogout={this.logoutUser}
                  djs={allDjs}
                  onGoBack={this.goFanPage}
                  onFanSelect={this.addFanEvent}
                />
              )} />
              <Route path="/fan-event" render={props => (
                <FanEvent
                  userInfo={userInfo}
                  fanEvent={fanEvent}
                  onJoin={this.joinEvent}
                  onLogout={this.logoutUser}
                />
              )} />
              <Route path="/fan-tip" render={props => (
                <TippingPage
                    userInfo={userInfo}
                    fanEvent={fanEvent}
                    allDjs={allDjs}
                    onLeave={this.leaveEvent}
                    onSubmit={this.submitSongRequest}
                    onLogout={this.logoutUser}
                  />)}
                />
              )} />
              <Redirect to="/home" />
          </Switch>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(MainPage)
