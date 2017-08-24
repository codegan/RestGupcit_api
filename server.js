var express    = require('express');
var app        = express();
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var router     = express.Router();
var appRoutes  = require('./app/routes/api')(router);
var path       = require('path');
var passport   = require('passport');
var social	   = require('./app/passport/passport')(app, passport);

var port = process.env.PORT || 8081;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api', appRoutes);



mongoose.connect('mongodb://root:opqewwp12@ds031895.mlab.com:31895/waycode', function(err){
	if(err){
		console.log('Not connected to the database ' + err);
	}else{
		console.log('Successfully connected to MongoDb');
	}
});

app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port, function(){
	console.log("running the server on port "+ port);
});
