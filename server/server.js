const express = require('express')
const path = require('path')
let querystring = require('querystring')
let request = require('request')
var cors = require('cors')
var cookieParser = require('cookie-parser')

const {SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET} = require('./SpotifyKeys.js')
const PORT = process.env.PORT || 8080
const app = express()


let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888'

app.use(express.static('public'))
.use(cors())
.use(cookieParser())
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

// var whitelist = ['https://accounts.spotify.com', 'http://localhost:3000']
// var corsOptions = {
//   origin: function (origin, callback) {
//     console.log('Origin ---> ', origin)
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }


app.get('/login', (req, res) => {
  console.log('CLIENT ID ----> ', SPOTIFY_CLIENT_ID)
  console.log('SPOTIFY CLIENT SECRET -----> ', SPOTIFY_CLIENT_SECRET)
  // let test =   querystring.stringify({
  //   response_type: 'code',
  //   client_id: SPOTIFY_CLIENT_ID,
  //   scope: 'user-read-private user-read-email',
  //   redirect_uri
  // })
  // console.log('Test ----> ', test)
  // console.log('Redirect UI ----> ', redirect_uri)
  res.redirect('https://accounts.spotify.com/authorize?' +
  querystring.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: 'user-read-private user-read-email',
    redirect_uri
  }))
  console.log('After QUering ')
})

app.get('/callback', (req, res) => {
  let code = req.query.code || null
  console.log('Callback is invoked ---> ')
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  console.log('REQUEST POST')
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('Listening to PORT ---> ', PORT)
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})
