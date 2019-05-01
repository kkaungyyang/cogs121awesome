const express = require('express'); 
const bodyParser = require('body-parser'); 
const path = require('path');
const firebase = require("firebase");
const admin = require('firebase-admin');
const firebaseConfig = require('./firebase-credentials.json')
const app = express(); 


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firebaseDB = firebase.database(); // reference to Firestore Realtime DB
// for (breed of Object.keys(fakeDatabase) ) {
//   db.collection('facts').doc(breed).set(fakeDatabase[breed]); 
// }
const writeToDB =  false;
if (writeToDB) { // Upload data from dog breeds API
 
  let breed = 'Irish Terrier2';
  firebaseDB.ref('breedInfo/' + breed).set({ // Add info on each breed of dog to DB
    height: {
      "imperial": "18",
      "metric": "46"
    },
    life_span: "12 - 16 years",
    temperament: "Respectful, Lively, Intelligent, Dominant, Protective, Trainable",
    weight: {
      "imperial": "25 - 27",
      "metric": "11 - 12"
    }
  }).then(
    console.log("Successful write to firebase database!")
  );
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


const fakeDatabase = {
  'Dog':{}, 
  'Cat':{},
  'Bird':{},
  'Hamster':{},
  'Horse':{},
  'Rabbit':{}
};


/* CODE */
app.get('/', function(req,res){
	res.render('index', {
		animals: Object.keys(fakeDatabase)
	});
});

app.get('/search/:animal', function(req,res){
	res.render('search', {
	 	currentAnimal: req.params.animal
	 });
});

//temp hardcode ajax fetch for breed match
app.get('/fetch', function(req,res) {
  // db.collection('facts').doc(breed).get().then( doc => { // TODO: Consider mix of breeds
  //   res.send(doc)
  // }).catch( err => {
  //   console.log('Error getting info on breed', err)
  // });

	res.send({"Golden Retriever": "Loyal happy breed.", "Lab": "Kind happy breed."});
});

const PORT = process.env.PORT || 3000; 
 app.listen( PORT, () => {
     console.log(`Server running on port ${PORT}`);
 });

module.exports = app;
