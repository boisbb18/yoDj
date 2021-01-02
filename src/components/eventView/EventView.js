import React from 'react'
import {withRouter} from 'react-router-dom'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import Header from '../header'

class EventView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timerTime: 0,
      timerStart: 0,

    }
    this.handleClose = this.handleClose.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.timeFormatter = this.timeFormatter.bind(this)
    this.goBack = this.goBack.bind(this)
    this.getTime = this.getTime.bind(this)
  }

  componentDidMount() {
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

  componentDidUpdate(prevProps) {
    let {event: {startDate}} = this.props

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

  handleClose() {
    this.props.onFinish()
  }

  getTime() {
    let {event: {startDate}} = this.props
    startDate = new Date(startDate)
    return startDate.toLocaleString('en-US', {hour: 'numeric', hour12: true})
  }

  goBack() {
    this.props.history.push('/home')
  }

  render() {
    let {userInfo, 
        event = {},
        event: {
          completed = {}
        } = {}} = this.props
    let tip = parseFloat(event.tipAmount).toFixed(2)
    let time = this.timeFormatter()
    let eventName = event.placeName ? event.placeName.charAt(0) : '';
    let completedEvents = Object.keys(completed).length;
    let tipsEarned = Object.values(completed).reduce((acc, event) => {
        acc += event.tip || event.tipAmount;
        return acc;
    }, 0)
    return (
      <div className="EventView">
        <Header imageUrl={userInfo.imageUrl} iconClick={this.profileImgClicked} isActive={true} onClick={() => {}}/>
        <div className="EventView__subheader">
          <Icon onClick ={this.goBack}>close</Icon>
          <div className="EventView--subtitle">{event.placeName}</div>
       </div>
       <div className="EventView__main-container">
         <div className="EventView--headset">
            <Icon classes={{root: 'EventView--headset-icon'}}>headset</Icon>
         </div>
        <div className="EventView--time-container">
          <div>Elapsed Time</div>
          <div className="EventView--time">{time}</div>
          <div className="EventView--info"> Started at {this.getTime()}</div>
        </div>
        <div className="EventView--icon">{eventName}</div>
       </div>
       <div className="EventView--address">{event.address}</div>
       <div className="EventView__tip-container">
        Minimum tip required for request:
        <p>${tip}</p>
       </div>
       <div className="EventView__request-container">
        {completedEvents} Song Request Completed
        <p>${tipsEarned.toFixed(2)} Earned</p>
       </div>
       <div className="EventView--end-action">
        <Button variant="contained" color="primary" classes={{root: 'EventView__end'}} onClick={this.handleClose}>End</Button>
      </div>
      </div>
    )
  }
}

export default withRouter(EventView)

