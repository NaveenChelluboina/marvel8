const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const commonemitter = require('../../../lib/custom-events').commonEmitter;
const ORM = require('../../associations/table_associations');
const functions = require('../../../lib/functions');
const async = require('async');
const sgMail = require('@sendgrid/mail');
// const sgMail = require('@sendgrid/mail');
var config = require('../../../config');
var Sequelize = require("sequelize");
var _ = require('underscore');
var param = process.argv[2];
var originurl = config[param];
// sgMail.setApiKey(config['sendgridKey']);
sgMail.setApiKey(config['sendgridKey']);
var originServerUrl = config[param+'Serv'];
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.getSettings = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            let orderBy = [["settings_id",  "asc"]];
            const adminSettings = ORM.model('trs_tbl_admin_settings');
            return adminSettings.findAndCountAll({order:orderBy}).then(settings => {
            return resolve({success:true, results:settings.rows, count:settings.count});
            
        }).catch(err => {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        });
        
    } catch(err) {
        console.log(err);
        return reject({ success: false, message: 'Something went wrong' });
    }
});
}

exports.updateSettings = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            if(!data.new_value)
            return reject({ success: false, message: 'Invalid params' });
            const adminSettings = ORM.model('trs_tbl_admin_settings');
            let queryWhere = {"settings_id": {$in:[data.settings_id]}};
            return adminSettings.findOne({where:queryWhere}).then(setting => {
                if(setting) {
                    setting['setting_value'] = data.new_value;
                    return setting.save({"validate":true, "userId":req.session.userId}).then(updateres => {
                        return resolve({"success":true});
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                } else {
                    return reject({ success: false, message:"Settings not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        } catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}