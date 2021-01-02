import React from 'react'
import {withRouter} from 'react-router-dom'
import firebase from 'firebase'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Icon from '@material-ui/core/Icon'
import fire from 'src/config/Fire'
import FeedContainer from '../feedContainer'
import EventWrapper from '../eventWrapper'
import Header from '../header'

class Homepage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: false,
      requestOpen: false,
      requestMessage: '',
      errorMessage: '',
      errorOpen: false
    }
    this.openProfile = this.openProfile.bind(this)
    this.activate = this.activate.bind(this)
    this.removeEvent = this.removeEvent.bind(this)
    this.openEvent = this.openEvent.bind(this)
    this.requestOpen = this.requestOpen.bind(this)
    this.acceptSong = this.acceptSong.bind(this)
    this.forwardFeedPage = this.forwardFeedPage.bind(this)
    this.openDeliverPage = this.openDeliverPage.bind(this)
    this.handleRejection = this.handleRejection.bind(this)
    this.handleErrorMessage = this.handleErrorMessage.bind(this)
    this.handleErrorClose = this.handleErrorClose.bind(this)
  }

  componentDidMount() {
    let {event, userInfo} = this.props
    if (userInfo.type && userInfo.type === 'fan') {
      this.props.history.push('/fan-home')
      return
    }
    if (Object.keys(event).length > 0) {
      this.setState({
        active: true
      })
    }
    this.authListener()
  }

  componentDidUpdate(prevProps, prevState) {
    let {event, userInfo, isActive} = this.props
    if ((Object.keys(prevProps.event).length !== Object.keys(event).length) && (isActive !== prevProps.isActive) ) {
      this.setState({
        active: !this.state.active
      })
    }
    if (userInfo.type && userInfo.type === 'fan') {
      this.props.history.push('/fan-home')
      return
    }
  }

  requestOpen(open, type = '') {
    let requestMessage = (type === 'accept')
      ? 'Are you sure you want to accept this req?'
      : 'Are you sure you want to reject this req?'
    this.setState({
      requestOpen: open,
      requestMessage
    })
  }

  handleErrorMessage(errorMessage) {
    this.setState({
      errorOpen: true,
      errorMessage
    })
  }

  authListener() {

  }

  acceptSong(request) {
    let {requests, acceptedSongs} = this.props
    if (acceptedSongs.length < 1) {
      this.props.history.push({
        pathname:'/accept-request',
        state: {request: {...request}}
      })
    }

  }

  forwardFeedPage() {
    let {requests} = this.props
    this.props.history.push({
      pathname: '/feed',
      state: {requests: requests}
    })
  }

  openEvent() {
    this.props.history.push('/event')
  }

  removeEvent() {
    this.props.onFinish()
  }

  openProfile() {
    this.props.onLogout()
  }

  activate() {
    this.props.history.push('/new-event')
  }

  openDeliverPage() {
    this.props.onDeliver()
  }

  handleRejection(request) {
    this.props.onReject(request)
  }

  handleErrorClose() {
    this.setState({
      errorOpen: false,
      errorMessage: ''
    })
  }

  render() {
    let {userInfo, event, requests, acceptedSongs} = this.props
    let {requestOpen, requestMessage, active} = this.state
    let boxShadowColor = active ? '#08FF00' : 'yellow'
    let boxShadow = `1px 2px 4px 1px ${boxShadowColor} inset, 1px 1px 4px 3px ${boxShadowColor}`
    return (
      <div className={`Homepage${requestOpen ? ' Homepage--hide' : ''}`}>
        <Header imageUrl={userInfo.imageUrl} iconClick={this.openProfile} isActive={this.state.active} />
        <div className="Homepage__main-container">
          <div className="Homepage__event-container">
            <EventWrapper onCreate={this.activate} active={this.state.active} event={event} onTitle={this.openEvent} />
            <div className="Homepage--border" style={{boxShadow: boxShadow, backgroundColor: boxShadowColor}}/>
          </div>
          <div className="Homepage__feed-container">
            <FeedContainer
              active={this.state.active}
              event={event}
              requests={requests}
              acceptedSongs={acceptedSongs}
              onRequestOpen={this.requestOpen}
              openRequestModal={requestOpen}
              requestMessage={requestMessage}
              onAccept={this.acceptSong}
              onForward={this.forwardFeedPage}
              onReject={this.handleRejection}
              onError={this.handleErrorMessage}
            />
            <div className="Homepage--border" style={{boxShadow: boxShadow, backgroundColor: boxShadowColor}}/>
          </div>
          <div className="Homepage__tip-container">
            <div className={`Homepage--queue-title${this.state.active && acceptedSongs.length > 0 
              ? ' Homepage--started-title' : ''}`} onClick={this.openDeliverPage}>Queue</div>
            <div className="Homepage--queue-subtitle">
              {acceptedSongs.length} songs are in a queue
            </div>
          </div>
        </div>
        <Snackbar
        bodyStyle={{ backgroundColor: 'teal', color: 'coral' }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.errorOpen}
          autoHideDuration={3000}
          onClose={this.handleErrorClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.errorMessage}</span>}
          action={[
              <IconButton
                key="close"
                arial-label="Close"
                color="inherit"
                onClick={this.handleErrorClose}
              >
                <CloseIcon />
              </IconButton>
          ]} />
      </div>
    )
  }
}

export default withRouter(Homepage)
