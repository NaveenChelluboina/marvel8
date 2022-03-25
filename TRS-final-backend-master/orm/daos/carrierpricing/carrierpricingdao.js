const ORM = require('../../associations/table_associations');
var config = require('../../../config');
const functions = require('../../../lib/functions');
var _ = require('underscore');
var param = process.argv[2];
// var originurl = config[param];
var AWS = require('aws-sdk');
var fs = require('fs');
// var originServerUrl = config[param+'Serv'];
const winston = require('winston');
var formidable = require('formidable');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.getPricingData = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            if ("package_level" in data) {
                queryWhere['package_level'] =  {$like :'%'+data.package_level+'%'}; 
            }
            if ("number_of_fleets" in data) {
                queryWhere['number_of_fleets'] =  {$like :'%'+data.number_of_fleets+'%'}; 
            }
            if ("monthly_price" in data) {
                queryWhere['monthly_price'] =  {$like :'%'+data.monthly_price+'%'};
            }
            const pricing = ORM.model('trs_tbl_packages');
            const carriers = ORM.model('trs_tbl_carriers');
            return pricing.findAndCountAll({where:queryWhere,
                include : [
                    {model:carriers,required:false ,where:{'carrier_id':{$notIn:[1]}}, on :{'$trs_tbl_packages.package_id$':{'$col':'trs_tbl_carriers.package_id'}}}
                ]
            }).then(data => {
                // data.rows.forEach(element => {
                //     element = element.get({plain:true});


                // })
                return resolve({ "success": true, "results": data.rows, "count": data.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

exports.getPackageAmount = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {'package_id':functions.decrypt(data.package_id)};
            const pricing = ORM.model('trs_tbl_packages');
            return pricing.findAndCountAll({where:queryWhere}).then(data => {
                return resolve({ "success": true, "results": data.rows, "count": data.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}