import React from 'react'
import Tidal from 'tidal-api-wrapper'
import NumberFormat from 'react-number-format';
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Snackbar from '@material-ui/core/Snackbar'
import TextField from '@material-ui/core/TextField'
import Header from '../header'
import 'react-widgets/dist/css/react-widgets.css'
import ScrollToBottom, {useScrollToBottom, useSticky} from 'react-scroll-to-bottom';
import AsyncSelect from 'react-select/async';
import axios from 'axios'
import { parse } from 'terser';
import PaymentModal from '../paymentModal'


const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce(function(initial, item) {
        if (item) {
            var parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
    }, {});

window.location.hash = ''

class TippingPage extends React.Component {
    constructor(props) {
        super(props)
        this.inputWrapper = React.createRef()
        this.tippingWrapper = React.createRef()
        this.state = {
            tipText: '',
            searchText: '',
            isError: false,
            errorMessage: '',
            busySpinner: false,
            options: [],
            search: '',
            numberSubtracted: false,
            searchDropdown: null,
            tipWithNoSong: false, 
            spotifyToken: null,
            paymentModal: false,
            userCard: {sources: {}}
        }
        this.tipChange = this.tipChange.bind(this)
        this.leaveEvent = this.leaveEvent.bind(this)
        this.search = this.search.bind(this)
        this.submit = this.submit.bind(this)
        this.closeError = this.closeError.bind(this)
        this.openProfile = this.openProfile.bind(this)
        this.searchSong = this.searchSong.bind(this)
        this.setCursor = this.setCursor.bind(this)
        this.scrollToBottom = this.scrollToBottom.bind(this)
        this.inputChange = this.inputChange.bind(this)
        this.songSelected = this.songSelected.bind(this)
        this.loadOptions = this.loadOptions.bind(this)
        this.handleTip = this.handleTip.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.payTip = this.payTip.bind(this)
        this.closePaymentModal = this.closePaymentModal.bind(this)
        this.finishProcessingPayment = this.finishProcessingPayment.bind(this)
        this.handlePayment = this.handlePayment.bind(this)
        this.checkEvent = this.checkEvent.bind(this)
    }

    componentDidMount() {
        let {spotifyToken, onSetToken, onMakeSpotifyToken, userInfo} = this.props
        this.checkEvent()
        let _token = hash.access_token
        if (_token) {
            localStorage.setItem('spotifyToken', _token);
            onSetToken(_token)
        }
        else if (spotifyToken === 'NOT_FOUND') {
            onMakeSpotifyToken()
        }

        if (userInfo.card && userInfo.card !== '') {
            axios.get('/card', {params: {cardId: userInfo.card}})
            .then(res => {
                this.setState({
                    userCard: res.data
                })
            })
            .catch(e => console.log('Err ----> ', e))
        }

    }

    componentDidUpdate(prevProps) {
        let {userInfo} = this.props
        let {userInfo: prevInfo} = prevProps
        if ((prevInfo.venue && !userInfo.venue) || (prevInfo.venue && userInfo.venue && prevInfo.venue.id && !userInfo.venue.id)) {
            this.checkEvent()
        }
    }
    

    checkEvent() {
        let {userInfo} = this.props

        if (!userInfo.venue || (userInfo.venue && !userInfo.venue.id)) {
            this.props.onLeave()
        }
    }

    leaveEvent() {
        this.props.onLeave()
    }

    search(e) {
        this.setState({
            search: e
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

    sendMessage() {
        let {tipText, searchText} = this.state
        let {allDjs, fanEvent, userInfo} = this.props
        let idx = allDjs.map(user => user.userId).indexOf(fanEvent.dj)
        let postObj = {
            userPhone: allDjs[idx].phone ? allDjs[idx].phone : '', 
            requestInfo: {},
            requestType: 'received'
        }
        axios.post('/api/messages', {...postObj})
            // .then(res => {
            //     console.log('Request is send ---> ', res)
            // })
            .catch(err => console.log('Error at Sending message ---> ', err))
    }

    setCursor(e) {
        let {value, selectionEnd} = e.target
        e.target.setSelectionRange(value.length, value.length);        
    }

    payTip = async() => {
        let {userInfo: {card, cardId = ''}} = this.props
        let tipAmount = parseFloat(this.state.tipText) * 100
        let res = await axios.post('/pay', {stripeAccount: card, cardId, tipAmount})
        let {data} = res
        return data
    }

    async submit() {
        let {fanEvent, onSubmit} = this.props
        let tipAmount = parseFloat(this.state.tipText)
        let eventTip = parseFloat(fanEvent.tipAmount)
        let errorMessage = ''
        let isError = false
        let tipWithNoSong = false
        if (!tipAmount && tipAmount !== 0) {
            errorMessage = 'Tip Container should not be empty'
            isError = true
        }
        if (this.state.tipText === '') {
            errorMessage = 'Tip Container should not be empty'
            isError = true
        }
        if (eventTip > tipAmount) {
            errorMessage = 'Tip Amount is below Minimum'
            isError = true
        }
        if (this.state.searchText === '') {
            errorMessage = 'Are you sure you don\'t want to add music request?' 
            tipWithNoSong = true
            isError = true
        }

        this.setState({
            isError,
            errorMessage,
            tipWithNoSong,
            paymentModal: true
        })
        // if (isError) return
        // let paymentIntent = await this.payTip()
        // onSubmit({tipAmount, music: this.state.searchText, tipIntentId: paymentIntent.id, payment_method: paymentIntent.payment_method})
        // this.sendMessage()
        // this.setState({
        //     isError: true,
        //     errorMessage: 'Your request successfully submitted',
        //     tipText: '',
        //     search: '',
        //     searchText: '',
        //     options: [],
        //     searchDropdown: null
        // })
    
    }


    async handlePayment(paymentMethod = '') {
        let paymentIntent
        if (paymentMethod === 'creditCard') {
            paymentIntent = await this.payTip()
        }
        this.finishProcessingPayment(paymentIntent)
    }

    finishProcessingPayment(paymentIntent) {
        let {isError, tipWithNoSong, paymentModal, searchText, tipText} = this.state
        // let paymentIntent = {id: '', payment_method: ''}
        let tipAmount = parseFloat(tipText)
        this.props.onSubmit({tipAmount, music: searchText, tipIntentId: paymentIntent.id, payment_method: paymentIntent.payment_method})
        // this.sendMessage()
        this.setState({
            isError: true,
            errorMessage: 'Your request successfully submitted',
            tipText: '',
            search: '',
            searchText: '',
            options: [],
            searchDropdown: null
        })
    }

    closePaymentModal() {
        this.setState({
            paymentModal: false
        })
    }

    handleTip() {
        let {onSubmit} = this.props
        let tipAmount = parseFloat(this.state.tipText)
        onSubmit({tipAmount, music: ''})
        this.setState({
            isError: true,
            errorMessage: 'You tipped the DJ!',
            tipWithNoSong: false,
            tipText: '',
            search: '',
            searchText: '',
            options: [],
            searchDropdown: null
        })
    }

    handleCancel() {
        this.setState({
            isError: false,
            errorMessage: '',
            tipWithNoSong: false
        })
    }

    openProfile() {
        this.props.onLogout()
    }

    closeError() {
        this.setState({
            isError: false,
            errorMessage: ''
        })
    }

    async searchSong(searchText) {
        let {spotifyToken} = this.props
        try {
            let tracks = await axios({
                method: 'get',
                url: `https://api.spotify.com/v1/search?q=${searchText}&type=track&market=US&offset=0&limit=5`,
                headers: {'Authorization': `Bearer ${spotifyToken}`}
            })
            if (tracks && tracks.data) {
                let songs = tracks.data.tracks ? tracks.data.tracks.items : []
                songs = songs.map(song => {
                    if (song.artists && song.artists.length > 0 && song.name) {
                        return `${song.name} by ${song.artists[0].name}`
                    }
                })
                return songs.map(song => ({value: song, label: song}))
            }  
        } catch(e) {
            if (e.response.status === 401) {
                this.props.onMakeSpotifyToken()
            }

        }
        return tempdata
    }

     inputChange(e) {
        return e
    }

    scrollToBottom() {
        this.tippingWrapper.scrollIntoView({ behavior: "smooth" });
    }

    songSelected(e) {
        let {searchText} = this.state
        if (Object.keys(e).length > 0) {
            searchText = e.value
        }
        this.setState({
            searchDropdown: e,
            searchText
        })
    }
    
     async loadOptions (inputValue, callback) {
        let data = await this.searchSong(inputValue)
        callback(data);
    }

    render() {
        let {paymentModal, userCard} = this.state
        let {fanEvent, userInfo, allDjs} = this.props
        let eventDj = allDjs.reduce((acc, dj) => {
            if (dj.userId === fanEvent.dj) {
                acc = {...dj}
            }
            return acc
        }, {})
        let tip = parseFloat(fanEvent.tipAmount).toFixed(2)
        let completed = fanEvent.completed ? Object.keys(fanEvent.completed).length : 0

        const customInput = (<input 
            type="text"
            inputMode="decimanl"
            value={this.state.tipText}
            onChange={this.tipChange}
            className="TippingPage--tip-text"
            pattern="\d*"
            onClick={this.setCursor}
            placeholder="0.00" />)
    
        return (
            <div>
            <PaymentModal 
                isVisible={this.state.paymentModal} 
                onCloseModal={this.closePaymentModal} 
                onPay={this.handlePayment}
                userCard={userCard}
            />
            <div className={`TippingPage${paymentModal ? ' TippingPage--hide' : ''}`} ref={el => this.tippingWrapper = el}>
                <Header imageUrl={userInfo.imageUrl} iconClick={this.openProfile} isActive={true}/>
                <div className="TippingPage__fan-container">
                    <div className="TippingPage--icon-container">
                        <div className="TippingPage--headset">
                            <Icon classes={{root: `TippingPage--headset-icon`}}>headset</Icon>
                        </div>
                        <div className="TippingPage--dj-icon" style={{backgroundImage: `url(${eventDj.imageUrl})`}}/>
                        <div className="TippingPage--dj-name">{eventDj.username}</div>
                    </div>
                    <div className="TippingPage--place">{fanEvent.placeName}</div>
                    <div className="TippingPage--requests">{completed} Requests Completed</div>
                    <div className="TippingPage--leave-event">
                        <Button variant="contained" color="primary" classes={{root: 'TippingPage--button', label: 'TippingPage--button-label'}} onClick={this.leaveEvent}>
                            Leave Event
                        </Button>
                    </div>
                </div>
                <div className="TippingPage__tip-container">
                    <div className="TippingPage--amount">
                        <div className="TippingPage--subtitle">Tip<span className="TippingPage--subtitle-icon">></span></div>
                        <div className="TippingPage--input-container">
                            $
                            <div className="TippingPage--input">
                                <input
                                    type="text" inputMode="decimal" 
                                    // type="text"
                                    // inputMode="decimal"
                                    value={this.state.tipText}
                                    onChange={this.tipChange}
                                    className="TippingPage--tip-text"
                                    pattern="\d*"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="TippingPage--user-icon">
                                <svg className="TippingPage--sample-user" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M15 2H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zM9 4.75c1.24 0 2.25 1.01 2.25 2.25S10.24 9.25 9 9.25 6.75 8.24 6.75 7 7.76 4.75 9 4.75zM13.5 14h-9v-.75c0-1.5 3-2.25 4.5-2.25s4.5.75 4.5 2.25V14z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="TippingPage--minimum">
                        <span className="TippingPage--tip-amount">Song Request</span>
                        minimum ${tip}
                    </div>
                    <div className="TippingPage--search-container">
                        <div className="TippingPage--music-icon" />
                        <div className="TippingPage--search-input">
                            <AsyncSelect
                                className="TippingPage--dropdown"
                                value={this.state.searchDropdown}
                                isSearchable
                                onChange={this.songSelected}
                                cacheOptions
                                onInputChange={this.inputChange}
                                loadOptions={this.loadOptions}
                                styles={{option: (provided, state) => ({
                                    ...provided,
                                    color: 'black',
                                    fontWeight: 'bold'
                                })
                                }
                                }
                                placeholder="Choose the song"
                                // onChange={e => this.setState({searchDropdown: e})}
                                components={{
                                    IndicatorSeparator: () => null
                                }}
                            />
                        </div>
                    </div>
                    <div className="TippingPage--submit-button">
                        <Button variant="contained" color="primary" classes={{root: 'TippingPage-submit'}} onClick={this.submit}>
                            Submit
                        </Button>
                    </div>
                </div>
                <Snackbar
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  open={this.state.isError}
                  autoHideDuration={8000}
                  onClose={this.closeError}
                  ContentProps={{
                    'aria-describedby': 'message-id'
                }}
                variant="error"

                  message={
                    this.state.tipWithNoSong
                    ?  (
                        <div className="TippingPage--tip-message">
                            <div className="TippingPage--tip-title">{this.state.errorMessage}</div>
                            <div className="TippingPage--actions-container">
                                <Button variant="contained" color="primary" classes={{root: 'TippingPage--button', label: 'TippingPage--button-label'}} onClick={this.handleTip}>
                                    Tip
                                </Button>
                                <div className="TippingPage--cancel-btn">
                                    <Button variant="contained" color="primary" classes={{root: 'TippingPage--button', label: 'TippingPage--button-label'}} onClick={this.handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>)
                    : (<span id="message-id">{this.state.errorMessage}</span>)}
                  action={
                    !this.state.tipWithNoSong
                    ?  [  
                            <IconButton
                                key="close"
                                arial-label="Close"
                                color="inherit"
                                onClick={this.closeError}
                            >
                                <CloseIcon />
                            </IconButton>
                        ]
                    : []  
                } />
            </div>
            </div>
        )
    }
}

export default TippingPage
