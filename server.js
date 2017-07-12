var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');

var FileUtils = require('./file-util');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

var port = 8080;        

var router = express.Router();              

router.get('/', function(req, res) {
    res.json({ message: 'Cloud Dev server running' });   
});

router.get('/workspace/:workspaceId', function(req, res) {
	console.log(req.params);
	FileUtils.getWorkspace('./workspace/'+req.params.workspaceId)
			.then(function(result){
				res.json(result);
			})
			.catch(function(err){
				res.status(400).json({ message: err }); 
			});      
});

router.post('/post', function(req, res){
	console.log(req.body);

	res.json({ message: 'POST succesful'});
});

app.use('/api', router);

app.listen(port);
console.log('Server started listening to port ' + port);