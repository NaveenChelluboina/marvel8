var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var cron = require('node-cron');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var CronJob = require('cron').CronJob;
var cors = require('cors');
var methodOverride = require('method-override');
var moment = require('moment');
var path = require('path');
var session = require('express-session');
var morgan = require('morgan');
// var commonemitter = require('./lib/custom-events').commonEmitter;
var helmet = require('helmet')
var frameguard = require('frameguard');
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access-Log-' + moment().format('DD-MM-YYYY') + '.log'), { flags: 'a' });
var config = require('./config');
var associations = require('./orm/associations/table_associations');
var carrierassetsServices = require('./services/carrierassets/carrierassetsservices')
var carrierdriverServices = require('./services/carriercorporateinfo/carriercorporateinfoservices')
var param = process.argv[2];
var subscribeServices = require('./services/adminsubscriptions/adminsubscriptionservices');
var carrierAdminServices = require('./services/carrieradmin/carrieradminservices');
var originurl = config[param];
const winston = require('winston');
const keyPublishable = 'pk_live_R1YQ4FPNkC7xwpQqiszUdqGe00I3R4i4nK'; // Enter the key here
const keySecret = 'sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi'; // enter the secret here
let logger = winston.createLogger({
    
});
cron.schedule('* * * */1 *', () => {   
    carrierassetsServices.checkExpiryDateOfAsset();
    carrierdriverServices.checkExpiryDateOfDriver();

});

// var bucketName = config[param+'name'];
var corsOptions = {
    origin: originurl,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var carrieradminroutes = require('./routes/carrieradminroutes');
var carriercorporateinforoutes = require('./routes/carriercorporateinforoutes');
var carrierfleetroutes = require('./routes/carrierfleetroutes');
var carrierassetsroutes = require('./routes/carrierassets');
var carrierirsroutes = require('./routes/carrierirsroutes');
var carrierirproutes = require('./routes/carrierirproutes')
var carrierauthroutes = require('./routes/carrierauthroutes');
// var patientroutes = require('./routes/patientroutes');
var carrierhomeroutes = require('./routes/carrierhomeroutes');
var carrieriftaroutes = require('./routes/carrieriftaroutes');
var carrierpricing = require('./routes/carrierpricing');
var adminpaymentroutes = require('./routes/adminpaymentroutes');
var adminsubscriptionroutes = require('./routes/adminsubscriptionroutes');
var adminsettings = require('./routes/adminroutes')
var adminDashboard = require('./routes/admindashboardroutes')
var port = config[param + 'port'];

//middleware of application.
app.set('port', process.env.PORT || port);
app.use(methodOverride());
app.use(bodyParser.json());
app.use(cookieParser());
app.all('*', function(req, res, next) {
    res.header('X-Frame-Options', 'DENY');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Content-Length', '52250');
    res.header('X-XSS-Protection', '1');
    // res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Cache-Control', 'no-cache');
    next();
});


app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/uploads", express.static(__dirname + '/uploads'));

// setup the logger for all http requests.
app.use(morgan('combined', { stream: accessLogStream }));

//setting headers for security eg: x-frame options. 


app.all('*', function(req, res, next) {

    //Origin is the HTML/Angular domain from where the ExpressJS API would be called.
    res.header('Access-Control-Allow-Origin', originurl);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    //make sure you set this parameter and make it true so that Angular and Express are able to exchange session values between each other .

    next();

});
app.use(helmet());
app.use(frameguard({ action: 'deny' }));

app.set('trust proxy', 1) // trust first proxy.
app.use(session({
    secret: config.sessionSecret,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 60 * 50000,
        resave: true,
        rolling: true,
    },
    saveUninitialized: false,
    resave: false,
    rolling: true
}));

var jobNaukri = new CronJob({
    cronTime: '*/1 * * * *',
    onTick: function() {
        subscribeServices.updateACarrierFromStripe();
    },
    start: true,
    timeZone:'America/Los_Angeles'
});

jobNaukri.start();

var job = new CronJob({
    cronTime: '*/5 * * * *',
    onTick: function() {
        subscribeServices.getSubscriptionsFromDashboard();
    },
    start: true,
    timeZone:'America/Los_Angeles'
});

job.start();

var JobsNow = new CronJob({
    cronTime: '00 03 * * *',
    onTick: function() {
        carrierAdminServices.getSending();
    },
    start: true,
    timeZone:'Canada/Eastern'
});

JobsNow.start();


//Setting routes to express app.
carrieradminroutes.routes(app);
carriercorporateinforoutes.routes(app);
carrierauthroutes.routes(app);
// patientroutes.routes(app);
carrierfleetroutes.routes(app);
carrierassetsroutes.routes(app);
carrierirsroutes.routes(app);
carrierirproutes.routes(app);
carrieriftaroutes.routes(app);
carrierhomeroutes.routes(app);
carrierpricing.routes(app);
adminpaymentroutes.routes(app);
adminsubscriptionroutes.routes(app);
adminsettings.routes(app);
adminDashboard.routes(app);

console.log(config[param + 'DB'].dialect)

associations.setup('./orm/models', config[param + 'DB'].database , config[param + 'DB'].user, config[param + 'DB'].password, config[param + 'DB'].logger, {
    host: config[param + 'DB'].host,
    dialect: config[param + 'DB'].dialect,
    logging: config.logging,
    pool: {
        max: config[param + 'DB'].connectionLimit,
        min: 0,
        idle: 10000
    },
});

app.use(function(err, req, res, next) {
    // logger.warn("Error here");
    // console.log(err);
    commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg":err.stack});
    res.status(500).send({ "Error": err.stack });
});

//satrting server.
http.createServer(app).listen(app.get('port'), "0.0.0.0", function() {
    console.log('Server is listening on port ' + app.get('port'));
});
