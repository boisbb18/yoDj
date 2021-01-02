import React from 'react'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'


class EventWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timerTime: 0,
      timerStart: 0
    }
    this.createNewEvent = this.createNewEvent.bind(this)
    this.openEvent = this.openEvent.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.timeFormatter = this.timeFormatter.bind(this)
  }

  componentDidMount() {
    if (this.props.active) {
      let {event: {startDate}} = this.props
      if (startDate) {
        let now = new Date()
        let elapsedTime = now.getTime() - new Date(startDate).getTime()
        this.setState({
          timerTime: elapsedTime,
          timerStart: Date.now() - new Date(startDate).getTime()
        }, () => {
          this.startTimer()
        })
      }
    }
  }

  componentDidUpdate(prevProps) {
    let {event: {startDate}, active} = this.props
    if (!prevProps.active && active) {
      let now = new Date()
      let elapsedTime = now.getTime() - new Date(startDate).getTime()
      this.setState({
        timerTime: elapsedTime,
        timerStart: Date.now() - new Date(startDate).getTime()
      }, () => {
        this.startTimer()
      })
    }
    if (!prevProps.event.startDate && startDate) {
      let now = new Date()
      let elapsedTime = now.getTime() - new Date(startDate).getTime()
      this.setState({
        timerTime: elapsedTime,
        timerStart: Date.now() - new Date(startDate).getTime()
      }, () => {
        clearInterval(this.timer)
        this.startTimer()
      })
    }

  }

  startTimer() {
    this.setState({
      timerTime: this.state.timerTime,
      timerStart: Date.now() - this.state.timerTime
    })
    this.timer = setInterval(() => (
      this.setState({
        timerTime: Date.now() - this.state.timerStart
      }),
    1000))
  }

  timeFormatter() {
    let {timerTime} = this.state
    let seconds = ("0" + (Math.floor(timerTime / 1000) % 60)).slice(-2)
    let minutes = ("0" + (Math.floor(timerTime / 60000) % 60)).slice(-2)
    let hours = ("0" + Math.floor(timerTime / 3600000)).slice(-2)
    return `${hours} : ${minutes} : ${seconds}`
  }


  componentWillUnmount() {
    clearInterval(this.timer)
  }

  createNewEvent(e) {
    e.preventDefault()
    this.props.onCreate()
  }

  openEvent(e) {
    e.preventDefault()
    this.props.onTitle()
  }

  render() {
    let {active, event: {address, placeName, tipAmount, type}, event} = this.props
    let tip = parseFloat(tipAmount).toFixed(2)
    let time = active ? this.timeFormatter() : "Duration"
    let completed = event.completed ? Object.keys(event.completed).length : 0
    let street, city, state
    if (address) {
      let splitAddress = address.split(', ')
      street = splitAddress[0]
      city =  splitAddress.length > 1 ? splitAddress[1] : 'Chicago'
      state = splitAddress.length > 2 ? splitAddress[2].split(' ')[0] : 'IL'
    }
    let eventName = active ? placeName.charAt(0).toUpperCase() : ''
    return (
      <div className="EventWrapper">
        <div className={`EventWrapper__address-container${!active ? ' EventWrapper--disable' : ''}`}>
          <div className="EventWrapper--address">{active ? street : "Address"}</div>
          <div className="EventWrapper--city">
           {
             active ? `${city}, ${state}` : 'City, State'
           }
          </div>
          <div className="EventWrapper--tip">
            min: ${active ? tip : '0.00'}
          </div>
        </div>
        <div className="EventWrapper__icon-container">
          <div className={`EventWrapper--headset${!active ? ' EventWrapper--disable' : ''}`}>
            <Icon classes={{root: `EventWrapper--headset-icon${active ? ' EventWrapper--started' : ''}`}}>headset</Icon>
          </div>
          <h3 className={!active ? 'EventWrapper--disable' : ''}>{time}</h3>
          <Button variant="contained" color="primary" classes={{root: `EventWrapper--action${active ? ' EventWrapper--disable-button' : ''}`}} onClick={this.createNewEvent}>
            Create
          </Button>
        </div>
        <div className={`EventWrapper__event${!active ? ' EventWrapper--disable' : ''}`}>
          <h3 className={active ? 'EventWrapper--started-title' : ''} onClick={this.openEvent}>{active ? placeName : 'Event'}</h3>
          <div className={`EventWrapper--icon${active ? ' EventWrapper--started' : ''}`}>{eventName}</div>
          <div className="EventWrapper--requests">
            {completed} Requests Completed
          </div>
        </div>
      </div>
    )
  }
}

export default EventWrapper
