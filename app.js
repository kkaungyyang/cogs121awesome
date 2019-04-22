const express = require('express'); 
const bodyParser = require('body-parser'); 
const path = require('path');
const app = express(); 

app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000, () => {
    console.log("==> Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = app;