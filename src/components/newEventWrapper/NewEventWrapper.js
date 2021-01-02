import React from 'react'
import {withRouter} from 'react-router-dom'
import firebase from 'firebase'
import Script from 'react-load-script'
import Icon from '@material-ui/core/Icon'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import Header from '../header'
import Button from '@material-ui/core/Button'
import NumberFormat from 'react-number-format'
import Dropdown from '../dropdown'
import {googlePlaces} from 'src/config/CustomKeys'
import CardModal from '../cardModal'

class NewEventWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      placeName: '',
      location: '',
      type: 'Venue',
      tipText: '',
      tipAmount: '',
      numberSubtracted: false,
      eventName: '',
      showCardModal: false
    }
    this.profileImgClicked = this.profileImgClicked.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handleLocation = this.handleLocation.bind(this)
    this.typeChange = this.typeChange.bind(this)
    this.tipChange = this.tipChange.bind(this)
    this.createEvent = this.createEvent.bind(this)
    this.close = this.close.bind(this)
    this.selectChange = this.selectChange.bind(this)
    this.handleScriptLoad = this.handleScriptLoad.bind(this)
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this)
    this.setCursor = this.setCursor.bind(this)
    this.closeCardModal = this.closeCardModal.bind(this)
    this.openCardInfo = this.openCardInfo.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    let {type, placeName} = this.state
    if (prevState.type !== type && type === 'Party') {
      google.maps.event.clearInstanceListeners(document.getElementById('autocomplete'))
    }
    else if (prevState.type !== type && type === 'Venue') {
      var options = {componentRestrictions: {country: 'us'}}
      this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), options)
      this.autocomplete.addListener('place_changed', this.handlePlaceSelect)
    }
    else if (prevState.placeName !== placeName) {
      this.setState({
        eventName: placeName.charAt(0).toUpperCase()
      })
    }
  }

  handleName(e) {
    let {type} = this.state
    this.setState({
      placeName: e.target.value
    })
  }

  close() {
    this.props.history.push('/home')
  }

  handleLocation(e) {
    this.setState({
      location: e.target.value
    })
  }

  profileImgClicked() {
    this.props.onLogout()
  }

  setCursor(e) {
    let {value, selectionEnd} = e.target
    e.target.setSelectionRange(value.length, value.length);        
  }

  typeChange(e) {
    this.setState({
      type: e.target.value
    })
  }

  tipChange(e) {
    let {value} = e.target
    let tipText = value
    let arr = value.split('.')
    if (arr.length > 1) {
      if (arr[1].length > 2) {
        tipText = parseFloat(value).toFixed(2)
      }
    }

    this.setState({
        tipText
    })
  }

  createEvent() {
    let {placeName, location, type, tipAmount, tipText} = this.state
    let {userId} = this.props
    let {userInfo: {card}} = this.props
    if (!card) {
      this.setState({
        showCardModal: true
      })
      return
    }
    if (placeName !== '' && location !== '' && type !== '' && tipText !== '' ) {
      let now = new Date().getTime()
      let newRequest = {
        placeName,
        address: location,
        type,
        tipAmount: parseFloat(tipText).toFixed(2).toString(),
        startDate: now
      }
      let venue = firebase.database().ref('venues').push({...newRequest, dj: userId})
      newRequest.requestId = venue.key
      firebase.database().ref(`users/${userId}/event`).set(newRequest,  error => {
        if (!error) {
          this.props.history.push('/home')
        }
      })
    }
  }

  selectChange(type) {
    this.setState({
      type
    })
  }

  handleScriptLoad() {
    let {type} = this.state
    if (type !== 'Party') {
      var options = {componentRestrictions: {country: 'us'}}
      this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), options)
      this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
    }
  }

  handlePlaceSelect() {
    if (this.autocomplete) {
      let addressObject = this.autocomplete.getPlace()
      let address = addressObject.formatted_address
  
      if (address) {
        this.setState({
          location: address,
          placeName: addressObject.name
        })
      }
    }
  }

  closeCardModal() {
    this.setState({
      showCardModal: false
    })
  }

  openCardInfo() {
    // this.props.history.push('/bank')
    this.props.history.push({
      pathname:'/bank',
      state: {pastUrl: '/new-event'}
    })
  }

  render() {
    let {userInfo} = this.props
    let {type, eventName, showCardModal} = this.state
    return (
      <div className="NewEventWrapper">
        <Header imageUrl={userInfo.imageUrl} iconClick={this.profileImgClicked} isActive={false} onClick={() => {}}/>
        <CardModal
            isVisible={this.state.showCardModal}
            onCloseModal={this.closeCardModal}
            onOpenCardInfo={this.openCardInfo}
        />
       <div className="NewEventWrapper__subheader">
         <div className="NewEventWrapper--icon-subtitle">
          <Icon onClick ={this.close}>close</Icon>
         </div>
          <div className="NewEventWrapper--subtitle">Check In</div>
       </div>
       <div className={`NewEventWrapper__container${showCardModal ? ' NewEventWrapper--hide' : ''}`}>
        <h3>Event</h3>
        <div className="NewEventWrapper--icon">{eventName}</div>
          <Script url={`https://maps.googleapis.com/maps/api/js?key=${googlePlaces}&libraries=places`}
                  onLoad={this.handleScriptLoad}
            />
        <TextField
          id="autocomplete"
          value={this.state.placeName}
          placeholder="Place Name"
          margin="normal"
          classes={{root: "NewEventWrapper__text"}}
          onChange={this.handleName}
        />
        <TextField
          value={this.state.location}
          placeholder="Location Address"
          margin="normal"
          classes={{root: "NewEventWrapper__text"}}
          onChange={this.handleLocation}
        />
        <div className="NewEventWrapper__form-control">
          <Dropdown onChange={this.selectChange}/>
        </div>
        <div className="NewEventWrapper--tip-title">
            Minimimum tip required for request
        </div>
        <div className="NewEventWrapper--tip-container">
            {/* <TextField
              value={this.state.tipText}
              margin="normal"
              classes={{root: "NewEventWrapper--tip-text"}}
              onChange={this.tipChange}
              InputProps={{style: {textAlign: 'start', margin: '20px 0'}}}/> */}
          <div className="NewEventWrapper--text-cont">
            $
            <input
              type="text" inputMode="decimal" 
              value={this.state.tipText}
              onChange={this.tipChange}
              className="NewEventWrapper--tip-text"
              pattern="\d*"
              placeholder="0.00"
            />
          </div>
            <Button
              variant="contained"
              color="primary"
              onClick={this.createEvent}
              classes={{root: 'NewEventWrapper--create'}}
            > Create
            </Button>
        </div>
       </div>
      </div>
    )
  }
}

export default withRouter(NewEventWrapper)

