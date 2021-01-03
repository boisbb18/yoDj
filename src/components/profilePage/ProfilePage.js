import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {withRouter} from 'react-router-dom'
import Button from '@material-ui/core/Button'
import StarRatings from 'react-star-ratings'
import Header from '../header'
import moment from 'moment'

const events = [
  {placeName: 'Start Bar', time: '3/4 10pm', title: 'T'},
  {placeName: 'Sound Bar', time: '5/6 11pm', title: 'O'},
  {placeName: 'Prysm', time: '11/23 12am', title: 'P'},
  {placeName: 'Stereo', time: '2/10 10pm', title: 'E'},
]
class ProfilePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userCompletedEvents: []
    }
    this.iconClick = this.iconClick.bind(this)
    this.editClicked = this.editClicked.bind(this)
    this.logout = this.logout.bind(this)
    this.handleBank = this.handleBank.bind(this)
    this.handleSettings = this.handleSettings.bind(this)
    this.goBack = this.goBack.bind(this)
    this.handleTips = this.handleTips.bind(this)
  }

  goBack() {
    let {userInfo} = this.props
    if (userInfo.verificationType && userInfo.userType !== 'Fan') {
      this.props.history.push('/home')
    } else {
      this.props.history.push('/fan-home')
    }
  }

  iconClick() {
    console.log('Icon')
  }

  editClicked() {
    console.log('Edit Clicked')
  }

  logout() {
    this.props.onLogout()
  }

  handleBank() {
    console.log('Handle Bank')
    this.props.history.push('/bank')

  }

  handleTips() {
    console.log('Handle Tips is clicked')
    this.props.history.push('/tips')
  }

  handleSettings() {
    console.log('Setting is clicked')
  }

  render() {
    let {userInfo, endedEvents} = this.props
    let socialMedia = userInfo.verificationType && userInfo.verificationType === 'facebook' ? '../../images/facebook.png' : userInfo.verificationType === 'twitter' ? '../../images/twitter.png' : ''
    let eventsText = events.length === 1 ? 'event' : 'events'
    let completedEvents = []
    if (userInfo && userInfo.completed) {
      completedEvents = Object.keys(userInfo.completed).reduce((acc,event) => {
        if (endedEvents && endedEvents[event] && endedEvents[event].placeName) {
          // {placeName: 'Start Bar', time: '3/4 10pm', title: 'T'},
          let date = new Date(endedEvents[event].startDate)
          let time = moment(date).format('MM/DD h a')
          acc.push({
            placeName: endedEvents[event].placeName,
            time,
            title: endedEvents[event].placeName.charAt(0).toUpperCase()
          })
        }
        return acc
      }, [])

    }
    return (
      <div className="ProfilePage">
         <Header imageUrl={userInfo.imageUrl} iconClick={this.iconClick} isActive={true} />
         <div className="ProfilePage__subheader">
          <div className="ProfilePage--back-icon" onClick={this.goBack}><FontAwesomeIcon icon="arrow-left" /></div>
          <div className="ProfilePage--subtitle">Profile</div>
        </div>
        <div className="ProfilePage__container">
          <div className="ProfilePage--genre-container">
            <h3>Genres:</h3>
            <div className="ProfilePage--profile-genre">Hip-Hop</div>
            <div className="ProfilePage--profile-genre">Pop</div>
            <div className="ProfilePage--profile-genre">Neo Soul</div>
          </div>
          <div className="ProfilePage--icon-container">
            <div className="ProfilePage--icon" style={{backgroundImage: `url(${userInfo.imageUrl})`}} />
            <div className="ProfilePage--username">{userInfo.username}</div>
          </div>
          <div className="ProfilePage--settings">
            <Button variant="contained" color="primary" classes={{root: 'ProfilePage--edit'}} onClick={this.editClicked}><FontAwesomeIcon icon="cog" /><div className="ProfilePage--edit-text">Edit</div></Button>
            <div className="ProfilePage--fans">2 fans</div>
            {userInfo.verificationType ? <div className={`ProfilePage--${userInfo.verificationType}`}/> : null }
          </div>
        </div>
        <div className="ProfilePage--bank-buttons">
          <Button variant="contained" color="primary" classes={{root: 'ProfilePage--money', label: 'ProfilePage--money-label'}} onClick={this.handleBank}><FontAwesomeIcon icon="dollar-sign" /><div className="ProfilePage--money-text">Bank</div></Button>
          {userInfo.verificationType 
          ? <div className="ProfilePage--tip-wrapper">
              <Button variant="contained" color="primary" classes={{root: 'ProfilePage--tip', label: 'ProfilePage--money-label'}} onClick={this.handleTips}><FontAwesomeIcon icon="clock" /><div className="ProfilePage--money-text">Tips</div></Button>
            </div>
          : null}
        </div>
        <div className="ProfilePage--events-num">{`${completedEvents.length} ${eventsText}`}</div>
        <div className="ProfilePage__events-container">
          {
            completedEvents.map((event, index) => (
              <div className="ProfilePage__event-wrapper" key={index}>
                <div className="ProfilePage--event-icon">{event.title}</div>
                <div className="ProfilePage--event-place">{event.placeName}</div>
                <div className="ProfilePage--event-time">{event.time}</div>
              </div>
            ))
          }
        </div>
        <div className="ProfilePage--logout">
          <div className="ProfilePage--logout-button" onClick={this.logout}>
            <FontAwesomeIcon icon="power-off" />
          </div>
          <div className="ProfilePage--settings-button" onClick={this.handleSettings}>
            <FontAwesomeIcon icon="cog" />
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(ProfilePage)
