const winston = require('winston');
require('winston-daily-rotate-file');

let transport = new winston.transports.DailyRotateFile({
    filename: './logs/daily_query_log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: process.env.ENV === 'development' ? 'debug' : 'all'
});

let logger = winston.createLogger({
    // level: 'info',
    // format: winston.format.json(),
    transports: [
        transport,
        // new winston.transports.File({}),
        // new winston.transports.File({}),
    ]
});

module.exports = {
    'sessionSecret': 'trs2020!@#',
    'algorithm' : 'aes-256-ctr',
    'local': 'http://localhost:4200',
    'dev': 'http://dev.epermitbook.com',
    'qa': 'http://qatrs.optionmatrix.org',
    // 'localname':'TRS-local',
    // 'devname':'TRS-dev',
    // 'qaname':'TRS-qa',
    'prod': 'https://portal.permishare.com',
    'localServ': 'http://localhost:6500',
    'qaServ': 'http://qatrs.optionmatrix.org:6501',
    'devServ': 'http://dev.epermitbook.com:6501',
    'prodServ': 'https://portal.permishare.com:6500',
    'undefined': 'http://localhost:4200',
    'fromMailId': 'carrier@transreport.com',
    'sendgridKey' : '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',
    'localDB': {
        connectionLimit: 100,
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'trs_db',
        dialect:'mysql',
        logger:logger,
        logging:true
    },
    'devDB': {
        connectionLimit: 100,
        host: 'trs-testing.cvmodrmfnmkg.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Password1!1',
        database: 'trs_dev_new',
        dialect:'mysql',
        logger:logger,
        logging:false
    },
    'qaDB': {
        connectionLimit: 100,
        host: 'trs-testing.cvmodrmfnmkg.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Password1!1',
        database: 'trs_test',
        dialect:'mysql',
        logger:logger,
        logging:false
    },
    'prodDB': {
        connectionLimit: 100,
        host: 'trs-testing.cvmodrmfnmkg.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'Password1!1',
        database: 'trs_latest_prod',
        dialect:'mysql',
        logger:logger,
        logging:false
    },
    'localport': 6500,
    'devport': 6501,
    'qaport': 6501,
    'prodport': 6500
};

