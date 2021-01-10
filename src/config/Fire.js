import firebase from 'firebase'
const apiKey = process.env.API_KEY
const authDomain = process.env.AUTH_DOMAIN
const databaseURL = process.env.DATA_URL
const projectId = process.env.PROJECT_ID
const senderId = process.env.SENDER_ID

 const config = {
   apiKey,
   authDomain,
   databaseURL,
   projectId,
   storageBucket: '',
   messagingSenderId: senderId
 }

 const fire = firebase.initializeApp(config)
 const facebookProvider = new firebase.auth.FacebookAuthProvider()
 const twitterProvider = new firebase.auth.TwitterAuthProvider()
 export {fire, facebookProvider, twitterProvider}
