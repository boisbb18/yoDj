import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Button from '@material-ui/core/Button'
import StarRatings from 'react-star-ratings'
import Header from '../header'

const events = [
  {placeName: 'Start Bar', time: '3/4 10pm', title: 'T'},
  {placeName: 'Sound Bar', time: '5/6 11pm', title: 'O'},
  {placeName: 'Prysm', time: '11/23 12am', title: 'P'},
  {placeName: 'Stereo', time: '2/10 10pm', title: 'E'},
]
class ProfilePage extends React.Component {
  constructor(props) {
    super(props)
    this.iconClick = this.iconClick.bind(this)
    this.editClicked = this.editClicked.bind(this)
    this.logout = this.logout.bind(this)
    this.handleBank = this.handleBank.bind(this)
    this.handleSettings = this.handleSettings.bind(this)
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
  }

  handleSettings() {
    console.log('Setting is clicked')
  }

  render() {
    let {userInfo} = this.props
    let socialMedia = userInfo.verificationType && userInfo.verificationType === 'facebook' ? '../../images/facebook.png' : userInfo.verificationType === 'twitter' ? '../../images/twitter.png' : ''
    let eventsText = events.length === 1 ? 'event' : 'events'
    return (
      <div className="ProfilePage"> 
         <Header imageUrl={userInfo.imageUrl} iconClick={this.iconClick} isActive={true} />
         <div className="ProfilePage__subheader">
          <div className="ProfilePage--back-icon"><FontAwesomeIcon icon="arrow-left" /></div>
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
        <div className="ProfilePage--rating">
          <StarRatings
            rating={4.5}
            starDimension="20"
            starSpacing="5px"
            starRatedColor="white"
            starEmptyColor="#555"
          />
          <div className="ProfilePage--rating-num">17 ratings</div>
        </div>
        <div className="ProfilePage--bank-buttons">
          <Button variant="contained" color="primary" classes={{root: 'ProfilePage--money', label: 'ProfilePage--money-label'}} onClick={this.handleBank}><FontAwesomeIcon icon="dollar-sign" /><div className="ProfilePage--money-text">Bank</div></Button>
          <div className="ProfilePage--tip-wrapper">
            <Button variant="contained" color="primary" classes={{root: 'ProfilePage--tip', label: 'ProfilePage--money-label'}} onClick={this.handleBank}><FontAwesomeIcon icon="clock" /><div className="ProfilePage--money-text">Bank</div></Button>
          </div>
        </div>
        <div className="ProfilePage--events-num">{`${events.length} ${eventsText}`}</div>
        <div className="ProfilePage__events-container">
          {
            events.map((event, index) => (
              <div className="ProfilePage__event-wrapper" key={index}>
                <div className="ProfilePage--event-icon">{event.FontAwesomeIcontitle}</div>
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

export default ProfilePage