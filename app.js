const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const firebase = require('firebase-admin');
const serviceAccount = require('./editted-ucsd-firebase-adminsdk.json');
const https = require('https');
const app = express();
const seedDB = require("./public/js/seedDB");

// ----- FIREBASE ---------

// Initialize Firebase
// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
//   databaseURL: "https://editted-ucsd.firebaseio.com"
// });
const firebaseDB = firebase.database(); // reference to Firestore Realtime DB
const firebaseStorage = firebase.storage();

// Set bool to true to upload data from dog breeds API
const createDB = false;
if (createDB) {
  seedDB();
}

app.set('views', path.join(__dirname, 'views')); // specify that we want to use "views" folder for our "HTML" templates
app.set('view engine', 'ejs'); // specify our "view engine" will be ejs, aka let's use ejs


app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

//set to true lets you create nested objects
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


//  APP ROUTE 

// ---- ROUTES ----
app.get('/', function (req, res) {
  res.render('index');
});


app.get('/breed/:animal', function (req, res) {
  // currently only dog api
  firebaseDB.ref('breedInfo/').once('value').then(snapshot => {
    res.render('breed_list', {
      currentAnimal: req.params.animal,
      breeds: Object.keys(snapshot.val()),
      data: snapshot.val()
    });
  }).catch(err => {
    console.log('Error getting info on breeds', err)
  });

});

// temp -- displays breed db for testing
app.get('/dogapi', function (req, res) {

  firebaseDB.ref('breedInfo/').once('value').then(snapshot => {
    res.send(snapshot.val());
  }).catch(err => {
    console.log('Error getting info on breeds', err)
  });
});

app.get('/contact', function(req,res){
  res.render('contact');
});

app.get('/mlapi', function (req, res) {
  const imageUrl = req.query.imageUrl;
  https.get(`https://wedog.herokuapp.com/${imageUrl}`, (resp) => {
    console.log(`Successful request to ML API`);
    resp.setEncoding('utf8');
    let rawData;
    resp.on('data', (chunk) => { rawData = chunk; });
    resp.on('end', () => {
      res.send(rawData);
    });
  });
});

//temp hardcode ajax fetch for breed match
app.get('/fetch', function (req, res) {
  const breed = req.query.breed; // TODO: Add breed as data in ajax call
  firebaseDB.ref('breedInfo/' + breed).once('value').then(snapshot => {
    res.send(snapshot.val())
  }).catch(err => {
    console.log('Error getting info on breed', err)
  });
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started at process.env.PORT || 3000`);
});

module.exports = app;