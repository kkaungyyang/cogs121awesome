const express = require('express'); 
const bodyParser = require('body-parser'); 
const path = require('path');
const app = express(); 

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
app.get('/fetch', function(req,res){
	res.send({"Golden Retriever": "Loyal happy breed.", "Lab": "Kind happy breed."});
});

// app.listen(process.env.PORT || 3000, () => {
//     console.log("==> Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });

app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});

module.exports = app;