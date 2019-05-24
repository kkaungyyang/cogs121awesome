const express = require('express'); 
const bodyParser = require('body-parser'); 
const path = require('path');
// const firebase = require("firebase"); REMOVE
const firebase = require('firebase-admin');
const serviceAccount = require('./editted-ucsd-firebase-adminsdk.json');
// const firebaseConfig = require('./firebase-credentials.json') REMOVE
const https = require('https');
const app = express(); 

// ---------------------

// Initialize Firebase


firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://editted-ucsd.firebaseio.com"
});
const firebaseDB = firebase.database(); // reference to Firestore Realtime DB
const firebaseStorage = firebase.storage();

// Set bool to true to upload data from dog breeds API
const seedDB = false;
if (seedDB) { 
  const options = {
    host: 'api.thedogapi.com',
    path: '/v1/breeds'
  };
  options['x-api-key'] = 'a9e1cbf4-a8ac-41c3-9c30-06368bb36e0a';

  // Request data from TheDogAPI
  https.get(options,(res) => { 
    console.log(`Successful request to TheDogAPI`);
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log(`Received data on ${parsedData.length} breeds of dogs.`);
        
        // Add info on each breed of dog to DB
        console.log(`Writing data on ${parsedData.length} breeds of dogs to firebase.`);
        for (let breed_info of parsedData) { 
          const data = {
            breed: breed_info.name,
            temperament: breed_info.temperament || '',
            breed_for: breed_info.bred_for || '',
            life_span: breed_info.life_span || '',
            weight: `${breed_info.weight.imperial} lb OR ${breed_info.weight.metric} kg` || '',
            height: `${breed_info.height.imperial} in OR ${breed_info.height.metric} cm` || ''
          }
          firebaseDB.ref('breedInfo/' + data.breed).set(data);
        }
      } catch (e) {
        console.error(`Error parsing data: ${e.message}`);
      }
    });
  }).on('error', (err) => {
    console.error(`Error while requesting TheDogAPI api: ${err.message}`);
  });
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
  'Cat':{},
  'Dog':{}, 
  'Bird':{},
  'Fish':{},
  'Hamster':{},
  'Horse':{},
  'Monkey':{},
  'Rabbit':{},
  'Unicorn':{}
};


//  APP ROUTE 
const breedDatabase = {
  'DOG': {
    'Golden Retriever': 'Loyal happy breed.', 
    'Lab': 'Kind happy breed.'
  },
  'CAT': {
    'American Shorthair': 'Cute, likes to play.',
    'Persian': 'Calm, enjoys time alone.'
  },
  'BIRD':{
    'Parrot': 'Talks back.'
  },
  'HAMSTER':{
    'Winter White Dwarf': 'Plump, white.'
  },
  'HORSE':{
    'American Quarter': 'Excels at sprinting short distances.'
  },
  'RABBIT':{
    'Dutch Rabbit': 'Gentle, calm, easy going. Thrives on attention.'
  }

};


// ---- ROUTES ----
app.get('/', function(req,res){
	res.render('index', {
		animals: Object.keys(fakeDatabase)
	});
});


app.get('/upload/:animal', function(req,res){
	res.render('upload', {
	 	currentAnimal: req.params.animal
	 });
});

app.get('/breed', function(req,res){
  res.render('breed', {
		animals: Object.keys(fakeDatabase)
	});
});


// ui version 1: all collapsible 
app.get('/breed/:animal', function(req,res){
  //currently only dog api
  firebaseDB.ref('breedInfo/').once('value').then( snapshot => { // TODO: Consider mix of breeds
    res.render('breed_list',{
      currentAnimal: req.params.animal,
      breeds: Object.keys(snapshot.val()),
      data: snapshot.val()
    });
   }).catch( err => {
    console.log('Error getting info on breeds', err)
  });

});


//ui version 2: 1 info table displayed at top at time
app.get('/breed2/:animal', function(req,res){
  firebaseDB.ref('breedInfo/').once('value').then( snapshot => { // TODO: Consider mix of breeds
    res.render('breed_list2',{
      currentAnimal: req.params.animal,
      breeds: Object.keys(snapshot.val()),
      data: snapshot.val()
    });
   }).catch( err => {
    console.log('Error getting info on breeds', err)
  });
});


//temp for testing
app.get('/dogapi', function(req,res){

  firebaseDB.ref('breedInfo/').once('value').then( snapshot => { // TODO: Consider mix of breeds
    res.send(snapshot.val());
   }).catch( err => {
    console.log('Error getting info on breeds', err)
  });

});


// app.get('/breed/:animal/:breed', function(req,res){
// 	res.send({
//      currentAnimal: req.params.animal,
//      currentBreed: req.params.breed
// 	 });
// });


app.get('/contact', function(req,res){
  res.render('contact');
});

app.get('/mlapi', function(req,res) {
  const imageUrl = req.query.imageUrl;
  console.log(`image url is ${imageUrl}`);
  https.get(`https://wedog.herokuapp.com/${imageUrl}`,(resp) => { 
    console.log(`Successful request to ML API`);
    resp.setEncoding('utf8');
    let rawData;
    resp.on('data', (chunk) => { rawData = chunk; });
    resp.on('end', () => {
      console.log(rawData);
      res.send(rawData);
    });
  }); 
});

//temp hardcode ajax fetch for breed match
app.get('/fetch', function(req,res) {
  const breed = req.query.breed; // TODO: Add breed as data in ajax call
  firebaseDB.ref('breedInfo/' + breed).once('value').then( snapshot => { // TODO: Consider mix of breeds
    // console.log(`Breed is ${breed}`);
    // console.log(snapshot.val());
    // const data = snapshot.val();
    // Object.keys(data).forEach( info => {
    //   console.log(`${info} => ${data[info]}`);
    // })
    res.send(snapshot.val())
  }).catch( err => {
    console.log('Error getting info on breed', err)
  });
});


const PORT = process.env.PORT|| 3000; 
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

module.exports = app;