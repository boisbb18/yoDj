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


class NewEventWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      placeName: '',
      location: '',
      type: '',
      tipText: '',
      tipAmount: '',
      numberSubtracted: false
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

  }

  handleName(e) {
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
    let tipText
    // let {numberSubtracted} = this.state
    // if (value[0] === '$') {
    //   value = value.slice(1)
    // }
    // if (value.length > this.state.tipText.toString().length && !numberSubtracted) {
    //   let tip = parseFloat(value)
    //   tip = tip * 10
    //   tipText = tip.toFixed(2).toString()
    // } else if (numberSubtracted) {
    //     let tip = parseFloat(value)
    //     tipText = tip.toFixed(2).toString()
    //     numberSubtracted = false
    // } else if (!numberSubtracted){
    //     tipText = value
    //     numberSubtracted = true
    // }

  this.setState({
      // numberSubtracted,
      // tipText,
      // tipAmount: parseFloat(tipText)
      tipText: value
    })
  }

  createEvent() {
    let {placeName, location, type, tipAmount, tipText} = this.state
    console.log('PROPS ----> ', this.props)
    let {userId} = this.props
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
      console.log('User ID ---> ', userId)
      firebase.database().ref(`users/${userId}/event`).set(newRequest,  error => {
        console.log('Error ---> ', error)
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
    var options = {componentRestrictions: {country: 'us'}}
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), options)
    this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
  }

  handlePlaceSelect() {
    let addressObject = this.autocomplete.getPlace()
    let address = addressObject.formatted_address

    if (address) {
      this.setState({
        location: address,
        placeName: addressObject.name
      })
    }

  }

  render() {
    let {userInfo} = this.props
    return (
      <div className="NewEventWrapper">
        <Header imageUrl={userInfo.imageUrl} iconClick={this.profileImgClicked} isActive={false} onClick={() => {}}/>
       <div className="NewEventWrapper__subheader">
          <Icon onClick ={this.close}>close</Icon>
          <div className="NewEventWrapper--subtitle">Check In</div>
       </div>
       <div className="NewEventWrapper__container">
        <h3>Event</h3>
        <div className="NewEventWrapper--icon" />
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

