import React from 'react'
import firebase from 'firebase'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import TextField from '@material-ui/core/TextField'
import {format, normalize} from 'react-phone-input-auto-format'
import {fire} from 'src/config/Fire'

class Login extends React.Component {
  static propTypes = {
    onAddUser: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      value: '',
      phone: '',
      codeSent: false,
      isError: false,
      errorMessage: ''
    }
    this.phoneRef = React.createRef()
    this.numberPressed = this.numberPressed.bind(this)
    this.removeNumber = this.removeNumber.bind(this)
    this.login = this.login.bind(this)
    this.verifyLoginCode = this.verifyLoginCode.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
  }

  componentDidMount() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(this.phoneRef, {'size': 'invisible'})
    window.recaptchaVerifier.render().then(widgetId => window.recaptchaWidgetId = widgetId)
  }

  componentWillUnmount() {
    window.recaptchaVerifier = null
    window.confirmationResult = null
  }

  numberPressed(num, numberTyped = false) {
    let {value, phone, codeSent} = this.state
    if (!numberTyped) {
      value += num
      phone += num
    } else {
      value = num
      phone = num.split('-').join('')
    }
    if (!codeSent) {
      value = format(value)
    }

    if ((codeSent && value.length < 7) || (!codeSent && value.length < 15)) {
      this.setState({
        value,
        phone
      })
    }
  }

  removeNumber(e) {
    e.preventDefault()
    let {value, phone} = this.state
    if (value !== '') {
      phone = phone.slice(0, phone.length - 1)
      value = format(phone)
      this.setState({
        value,
        phone
      })
    }
  }

  verifyLoginCode() {
    let {onAddUser} = this.props
    window.confirmationResult.confirm(this.state.phone)
      .then(result => {
        onAddUser(result.user)
        this.setState({
          phone: '',
          value: '',
          codeSent: false,
          isError: false,
          errorMessage: ''
        })
      })
      .catch(() => {
        this.setState({
          codeSent: false,
          errorMessage: 'Incorrent verification code. Try again!',
          isError: true,
          phone: '',
          value: ''
        })
        this.phoneRef.style.display = 'block'
      })
  }

  login(e) {
    e.preventDefault()
    let {codeSent, phone, value} = this.state
    let appVerifier = window.recaptchaVerifier
    phone = normalize(phone)
    let phoneNumber = `+1${phone}`;

    if (value.length !== 14 && !codeSent) {
      this.setState({
        errorMessage: 'Invalid phone number!',
        isError: true
      })
      return
    }

    if (codeSent && phone.length !== 6) {
      this.setState({
        errorMessage: 'Invalid Verification code!',
        isError: true
      })
      return
    }
    if (!codeSent) {
      fire.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(result => {
          this.setState({
            value: '',
            phone: '',
            codeSent: true
          })
          this.phoneRef.style.display = 'none'
          window.confirmationResult = result
        })
        .catch((e) => {
          this.phoneRef.style.display = 'block'
          console.log('Error Block --> ', e)
          this.setState({
            errorMessage: 'Invalid phone number!',
            isError: true
          })
        })
    } else {
      this.verifyLoginCode()
    }
  }

  handleClose() {
    this.setState({isError: false, errorMessage: ''})
  }

  handleTextChange(e) {
    let {codeSent, value} = this.state
    let num = normalize(e.target.value)
    if (!codeSent && !isNaN(num) && num !== '' && num !== ' ') {
      this.numberPressed(e.target.value, true)
    } 
    if (num === '' && e.target.value === '') {
      this.setState({
        value: '',
        phone: ''
      })
    }
    if (codeSent && (value.length < 6 || e.target.value.length < value.length)) {
     this.setState({
        value: e.target.value,
        phone: e.target.value
      })
    }
  }

  render() {
    let nums = [1,2,3,4,5,6,7,8,9]
    let {codeSent} = this.state
    return (
      <div className="Login">
        <div ref={ref => this.phoneRef = ref} className="Login__recaptcha"/>
        <div className="Login__logo">
          <div className="Login__icon" />
          <div className="Login__text">
             <input
               className="Login--text-field"
               type={!codeSent ? "tel" : "number"}
               value={this.state.value}
               onChange={this.handleTextChange}
               placeholder={`${this.state.codeSent ? 'Confirmation Code' : 'Enter Your Number'}`}

             />
          </div>
        </div>
        <div className="Login__numbers">
          {
            nums.map((num, index) => (
              <div className="Login__digit" key={index}>
                <Button variant="contained" color="primary" classes={{root: 'Login__digit-button'}} onClick={() => this.numberPressed(num)}>
                  {num}
                </Button>
              </div>
            ))
          }
         <div className="Login__digit"><Button variant="text" classes={{root: 'Login__action-button'}} onClick={this.removeNumber}>Clear</Button></div>
         <div className="Login__digit"><Button variant="contained" color="primary" classes={{root: 'Login__digit-button'}} onClick={() => this.numberPressed(0)}>0</Button></div>
         <div className="Login__digit"><Button variant="text" classes={{root: 'Login__action-button'}} onClick={this.login}>Login</Button></div>
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.isError}
          autoHideDuration={3000}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.errorMessage}</span>}
          action={[
              <IconButton
                key="close"
                arial-label="Close"
                color="inherit"
                onClick={this.handleClose}
              >
                <CloseIcon />
              </IconButton>
          ]} />
      </div>
    )
  }
}

export default Login
