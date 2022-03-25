const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const commonemitter = require('../../../lib/custom-events').commonEmitter;
const ORM = require('../../associations/table_associations');
const functions = require('../../../lib/functions');
const async = require('async');
const sgMail = require('@sendgrid/mail');
var fs = require('fs');
// const sgMail = require('@sendgrid/mail');
var config = require('../../../config');
var Sequelize = require("sequelize");
var _ = require('underscore');
var param = process.argv[2];
var originurl = config[param];
var AWS = require('aws-sdk');
// sgMail.setApiKey(config['sendgridKey']);
sgMail.setApiKey(config['sendgridKey']);
var originServerUrl = config[param + 'Serv'];
const winston = require('winston');
var formidable = require('formidable');
var DriverFCM = require('fcm-node');
const { info } = require('console');
var serverKey = 'AAAA379Jl14:APA91bGJHa1M9YwjSOMVjV-zjWYOzAuL4rANimLZUdJXXUTS_tb7d1NckMQUPNuDUKUI4Xi6Grs6vJRDyTSlfrm2e76H6UqRq7XtsUKtEvv9dFQcvJ5Ew1jOayf8cBp4UisHSL_XVEe6'; //put your server key here
var driverFCM = new DriverFCM(serverKey);
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.checkExpiryDateOfDriver = function (req, res) {
    return new Promise((resolve, reject) => {
        try {
            var myDate = new Date();
            const Drivers = ORM.model('trs_tbl_drivers');
            let itemArray = [];
            let queryWhere = { "is_deleted": 0, "is_active": 1, "inactive_date": { $lt: myDate } };
            let requiredFields = ["driver_id", "driver_first_name", "driver_last_name", "cell_phone", "email_address", "dl_number", "dl_class", "is_active", "is_deleted", "address1", "city", "country_id", "state_id", "start_date", "inactive_date", "comments", "created_by", "created_date", "modified_by", "modified_date", "carrier_id"];
            return Drivers.findAll({ attributes: requiredFields, where: queryWhere }).then(driver => {
                for (i = 0; i < driver.length; i++) {
                    if (driver[i].inactive_date) {
                        let finalObj = { "driver_id": driver[i].driver_id, "driver_first_name": driver[i].driver_first_name, "driver_last_name": driver[i].driver_last_name, "cell_phone": driver[i].cell_phone, "email_address": driver[i].email_address, "dl_number": driver[i].dl_number, "dl_class": driver[i].dl_class, "is_active": 0, "is_deleted": driver[i].is_deleted, "address1": driver[i].address1, "city": driver[i].city, "country_id": driver[i].country_id, "state_id": driver[i].state_id, "start_date": driver[i].start_date, "inactive_date": driver[i].inactive_date, "comments": driver[i].comments, "created_by": driver[i].created_by, "created_date": driver[i].created_date, "modified_by": driver[i].modified_by, "modified_date": driver[i].modified_date, "carrier_id": driver[i].carrier_id };
                        itemArray.push(finalObj);
                    }
                }
                if (itemArray.length != 0) {
                    Drivers.bulkCreate(itemArray, { updateOnDuplicate: ["is_active"] }).then(campaign => {
                        itemArray = [];
                        return resolve({ success: true, message: 'updated successfully' });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        } catch (error) {
            console.log(error);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });

}

exports.getStatesDropdown = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_active'] = 1;
            queryWhere['country_id'] = data.country_id;
            const States = ORM.model('trs_tbl_states');
            return States.findAndCountAll({ where: queryWhere }).then(states => {
                return resolve({ success: true, results: states.rows, count: states.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.addCorpInfo = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let arrayOfFiles = 0;
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({ success: false, message: err.message });
                }
                let infoObject = JSON.parse(fields.corpinfodata);
                let docsObject = JSON.parse(fields.documentsData);
                let messageNotification = infoObject.notification_message;
                delete infoObject.notification_message;
                // console.log(docsObject);
                if (infoObject.docsLength) {
                    for (let i = 0; i < infoObject.docsLength; i++) {
                        // console.log("here");
                        //console.log(files['filesnew'+i]);
                        let filestream = fs.createReadStream(files['filesnew' + i].path);
                        let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew' + i].name.split(' ').join('_')
                        let params = { Bucket: "permishare/dev/corporate-information", Key: namesToUpload, Body: filestream, ACL: "public-read" };

                        let data = await uploadFile(params);
                        if (data.success)
                            fileLocationInBucket.push(data.path);
                        fileNameInBucket.push(data.name);
                    }
                    // console.log(fileLocationInBucket);
                    const CorporateInformation = ORM.model('trs_tbl_corporate_information');
                    const CorporateInformationDocuments = ORM.model('trs_tbl_corporate_info_documents');
                    ORM.getObj().transaction().then(function (t) {
                        return CorporateInformation.create(infoObject, { "validate": true, "userId": functions.decrypt(req.session.userId), "transaction": t }).then(async caseRegistered => {
                            if (caseRegistered) {
                                let finalItems = [];
                                let NotificationCount = 0;
                                for (let i = 0; i < infoObject.docsLength; i++) {
                                    var item = {};
                                    if (docsObject[i].appAccess)
                                        NotificationCount++
                                    item = { "corporate_information_id": caseRegistered.corporate_information_id, "app_access": docsObject[i].appAccess, "document_name": docsObject[i].docRef, "document_originalname": fileNameInBucket[i], "document_type": docsObject[i].docType, "document_s3_url": fileLocationInBucket[i], "issue_date": docsObject[i].issueDate, "exp_date": docsObject[i].expiryDate, "created_by": functions.decrypt(req.session.userId), "modified_by": functions.decrypt(req.session.userId) };
                                    // if(i == 0)
                                    // item = {"case_id":caseRegistered.case_id , "user_id": userObject.attorney_id, user_type:1,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                    // if(i == 1)
                                    // item = {"case_id":caseRegistered.case_id , "user_id": userObject.referring_physician_id, user_type:2,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                    finalItems.push(item);
                                }
                                if (NotificationCount) {
                                    let sendDriverNotification = await notifyDrivers(infoObject.carrier_id, messageNotification, 0);
                                    if (!sendDriverNotification.success)
                                        return reject({ success: false, message: "Something went wrong" });
                                }
                                CorporateInformationDocuments.bulkCreate(finalItems, { "validate": true, "userId": functions.decrypt(req.session.userId), "transaction": t }).then(pResponse => {
                                    if (pResponse) {
                                        t.commit();
                                        return resolve({ success: true });
                                    }
                                    else {
                                        return reject({ success: false, message: "Something went wrong" });
                                    }
                                }).catch(err => {
                                    console.log(err);
                                    return reject({ success: false, message: "Something went wrong" });
                                });
                            }
                            else {
                                return reject({ success: false, message: "Something went wrong" });
                            }
                        }).catch(error => {
                            console.log(error);
                            return reject({ success: false, message: "Something went wrong" });
                        });
                    });
                }
                else {
                    const CorporateInformation = ORM.model('trs_tbl_corporate_information');
                    return CorporateInformation.create(infoObject, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(cases => {
                        if (cases) {
                            return resolve({ success: true });
                        }
                        else {
                            return reject({ success: false, message: "Something went wrong" });
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: "Something went wrong" });
                    });
                }
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.updateCorporateCocumentInfo = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let finalItems = [];
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({ success: false, message: err.message });
                }
                let infoObject = JSON.parse(fields.corpinfodata);
                let docsObject = JSON.parse(fields.documentsData);
                // console.log(infoObject);
                if (!infoObject.corporate_information_id) {
                    return reject({ success: false, message: "Invalid params" });
                }
                for (let i = 0; i < infoObject.docsLength; i++) {
                    let filestream = fs.createReadStream(files['filesnew' + i].path);
                    let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew' + i].name.split(' ').join('_')
                    let params = { Bucket: "permishare/dev/corporate-information", Key: namesToUpload, Body: filestream, ACL: "public-read" };
                    let data = await uploadFile(params);
                    if (data.success)
                        fileLocationInBucket.push(data.path);
                        fileNameInBucket.push(data.name);
                }
                const CorporateInformation = ORM.model('trs_tbl_corporate_information');
                const CorporateInformationDocuments = ORM.model('trs_tbl_corporate_info_documents');
                let queryWhere = { 'is_deleted': 0 };
                queryWhere = { "corporate_information_id": infoObject.corporate_information_id };
                if (infoObject.corporate_information_id) {
                    let NotificationCount = 0;
                    for (let i = 0; i < infoObject.docsLength; i++) {
                        var item = {};
                        if (docsObject[i].appAccess) {
                            NotificationCount++;
                        }
                        item = { "corporate_information_id": infoObject.corporate_information_id, "app_access": docsObject[i].appAccess, "document_name": docsObject[i].docRef, "document_originalname": fileNameInBucket[i], "document_type": docsObject[i].docType, "document_s3_url": fileLocationInBucket[i], "issue_date": docsObject[i].issueDate, "exp_date": docsObject[i].expiryDate, "created_by": functions.decrypt(req.session.userId), "modified_by": functions.decrypt(req.session.userId) };
                        finalItems.push(item);
                    }
                    if (NotificationCount) {
                        let sendDriverNotification = await notifyDrivers(infoObject.carrier_id, infoObject.notification_message, 0);
                        if (!sendDriverNotification.success)
                            return reject({ success: false, message: "Something went wrong" });
                    }
                }
                else {
                    // console.log("Log here");
                    return reject({ success: false, message: "I am logging here" });
                }
                delete infoObject.notification_message;
                CorporateInformationDocuments.bulkCreate(finalItems, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateRes => {
                    CorporateInformation.findOne({ where: queryWhere }).then(campaign => {
                        if (campaign) {
                            delete infoObject.corporate_information_id;
                            for (let key in infoObject) {
                                campaign[key] = infoObject[key];
                            }
                            return campaign.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                                return resolve({ "success": true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        } else {
                            return reject({ "success": false, "message": "Asset not found" });
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ "success": false, "message": "Something went wrong" });
                    })
                }).catch(err => {
                    console.log(err);
                    return reject({ "success": false, "message": "Something went wrong" });
                })
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.addDriver = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let arrayOfFiles = 0;
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({ success: false, message: err.message });
                }
                const Drivers = ORM.model('trs_tbl_drivers');
                const DriverDocs = ORM.model('trs_tbl_driver_documents');
                let infoObject = JSON.parse(fields.driverInfo);
                let docsObject = JSON.parse(fields.documentsData);
                let CarrierNameData = await getCarrierNameForEmail(infoObject.carrier_id);
                return Drivers.findOne({ where: { 'email_address': infoObject.email_address, "is_deleted": 0, "carrier_id": infoObject.carrier_id } }).then(async (roles) => {
                    if (roles) {
                        return reject({ success: false, message: "A driver with this email is already registered in PermiShare. Please use an alternative email" });
                    }
                    else {
                        return Drivers.findOne({ where: { 'email_address': infoObject.email_address, "is_deleted": 0, "is_active": 1 } }).then(async driverData => {
                            if (driverData) {
                                return reject({ success: false, message: "A driver with this email is already registered in PermiShare. Please use an alternative email" });
                            }
                            else {
                                for (let i = 0; i < infoObject.docsLength; i++) {
                                    // console.log("here");
                                    //console.log(files['filesnew'+i]);
                                    let filestream = fs.createReadStream(files['filesnew' + i].path);
                                    let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew' + i].name.split(' ').join('_')
                                    let params = { Bucket: "permishare/dev/driver-documents", Key: namesToUpload, Body: filestream, ACL: "public-read" };
                                    let data = await uploadFile(params);
                                    if (data.success)
                                        fileLocationInBucket.push(data.path);
                                    fileNameInBucket.push(data.name);
                                }
                                // console.log(fileLocationInBucket);
                                // const CorporateInformation = ORM.model('trs_tbl_corporate_information');
                                // const CorporateInformationDocuments = ORM.model('trs_tbl_corporate_info_documents');
                                ORM.getObj().transaction().then(function (t) {
                                    var accessToken = functions.randomValueBase64(20);
                                    let hash = bcrypt.hashSync(accessToken, 10);
                                    infoObject.password_reset_token = hash;
                                    infoObject.password = hash;
                                    return Drivers.create(infoObject, { "validate": true, "userId": functions.decrypt(req.session.userId), "transaction": t }).then(async caseRegistered => {
                                        if (caseRegistered) {
                                            var token = functions.encrypt(accessToken);
                                            var driverId = functions.encrypt(caseRegistered.driver_id.toString());
                                            var url = originurl + '/#/driververification?did=' + driverId + '&activationToken=' + token;
                                            var email = infoObject.email_address;
                                            let sending_email = await getSendingEmail(infoObject.carrier_id);
                                            let email_res = await sendActivationEmail(url, email, infoObject.driver_first_name + ' ' + infoObject.driver_last_name, sending_email.value, CarrierNameData.result);
                                            // let company_copy = await sendActivationEmail(url, 'support@permishare.com', infoObject.driver_first_name + ' ' + infoObject.driver_last_name, sending_email.value, CarrierNameData.result);
                                            if (email_res.success) {
                                                let finalItems = [];
                                                for (let i = 0; i < infoObject.docsLength; i++) {
                                                    var item = {};
                                                    item = { "driver_id": caseRegistered.driver_id, "document_name": docsObject[i].docRef, "app_access": docsObject[i].appAccess, "document_originalname": fileNameInBucket[i], "document_type": docsObject[i].docType, "document_s3_url": fileLocationInBucket[i], "issue_date": docsObject[i].issueDate, "exp_date": docsObject[i].expiryDate, "created_by": functions.decrypt(req.session.userId), "modified_by": functions.decrypt(req.session.userId), "carrier_id": infoObject.carrier_id };
                                                    // if(i == 0)
                                                    // item = {"case_id":caseRegistered.case_id , "user_id": userObject.attorney_id, user_type:1,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                                    // if(i == 1)
                                                    // item = {"case_id":caseRegistered.case_id , "user_id": userObject.referring_physician_id, user_type:2,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                                    finalItems.push(item);
                                                }
                                                DriverDocs.bulkCreate(finalItems, { "validate": true, "userId": functions.decrypt(req.session.userId), "transaction": t }).then(pResponse => {
                                                    if (pResponse) {
                                                        t.commit();
                                                        return resolve({ success: true });
                                                    }
                                                    else {
                                                        return reject({ success: false, message: "Something went wrong" });
                                                    }
                                                }).catch(err => {
                                                    console.log(err);
                                                    return reject({ success: false, message: "Something went wrong" });
                                                });
                                            } else {
                                                return reject(email_res);
                                            }

                                        }
                                        else {
                                            return reject({ success: false, message: "Something went wrong" });
                                        }
                                    }).catch(error => {
                                        console.log(error);
                                        return reject({ success: false, message: "Something went wrong" });
                                    });
                                });
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        })

                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: "Something went wrong" });
                });

            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

function getCarrierNameForEmail(ID) {
    return new Promise(function (resolve, reject) {
        try {
            const Carrier = ORM.model('trs_tbl_carriers');
            return Carrier.findOne({ where: { 'carrier_id': ID } }).then(carrierData => {
                return resolve({ success: true, result: carrierData.company_name });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function getSendingEmail(carrierId) {
    return new Promise(function (resolve, reject) {
        const settings = ORM.model('trs_tbl_settings_for_carriers');
        let queryWhere = { 'settings_id': 2, 'carrier_id': carrierId };
        // console.log(queryWhere);
        return settings.findOne({ where: queryWhere }).then(data => {
            return resolve({ success: true, value: data.setting_value });
        }).catch(err => {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        })
    })
}

function sendActivationEmail(url, email, name, sendingEmail, carrier) {
    return new Promise(function (resolve, reject) {
        const msg = {
            to: email,
            from: 'support@permishare.com',
            subject: 'PermiShare Mobile App for ' + carrier,
            html: '<p>Hello ' + functions.capitalizeString(name) + ',</p></br> <p>Welcome to PermiShare! You are receiving this email because you have been added as a user by your company’s administrator. PermiShare is revolutionizing how motor carriers ensure their drivers have 24/7 mobile access to government issued permits, licenses, authorities, and related information.</p> </br><p>To get started click the link below to set a password. You will receive a follow up email with links to the App Store and Google Play Store to download the PermiShare app.</p></br><b>' + url + '</b></br></br><p>Thanks</p></br><b>The PermiShare Team</b>' // html body
        };
        sgMail.send(msg).then(() => {
            return resolve({ "success": true, "message": "Account activation link is sent to your email. please check" });
        }).catch(error => {
            return reject({ "success": false, "message": "Failed to send verification link", "error": error.toString() });
        });
    });
}

async function uploadFile(params) {
    return new Promise(async function (resolve, reject) {
        let s3bucket = new AWS.S3({
            accessKeyId: "AKIAJHQH3V5CC4VGJEKQ",
            secretAccessKey: "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"
            //,Bucket : "clinical-scheduling/dev/lop"
        });

        await s3bucket.upload(params, function (err, data) {
            if (err) {
                //console.log("here")
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            }
            if (data) {
                //console.log("here")
                return resolve({ success: true, "path": data.Location, "name": data.Key.substr(data.Key.lastIndexOf('/') + 1) });
            }
        });
    });
}

exports.getDrivers = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.carrier_id)
                return reject({ success: false, message: "Carrier ID is missing" });
            let queryWhere = {};
            let stateWhere = {};
            let countryWhere = {};
            let orderBy = [];
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id;
            if ("driver_first_name" in data) {
                queryWhere['driver_first_name'] = { $like: '%' + data.driver_first_name + '%' };
            }
            if ("a-z" in data) {
                orderBy = [["driver_last_name", "asc"]];
            }
            if ("z-a" in data) {
                orderBy = [["driver_last_name", "desc"]];
            }
            if ("driver_last_name" in data) {
                queryWhere['driver_last_name'] = { $like: '%' + data.driver_last_name + '%' };
            }
            if ("dl_class" in data) {
                queryWhere['dl_class'] = { $like: '%' + data.dl_class + '%' };
            }
            if ("city" in data) {
                queryWhere['city'] = { $like: '%' + data.city + '%' };
            }
            if ("dl_number" in data) {
                queryWhere['dl_number'] = { $like: '%' + data.dl_number + '%' };
            }
            if ("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            if ("country_id" in data) {
                countryWhere["country_id"] = data.country_id;
            }
            if ("state_id" in data) {
                stateWhere["state_id"] = data.state_id;
            }
            const Drivers = ORM.model('trs_tbl_drivers');
            const DriverDocs = ORM.model('trs_tbl_driver_documents');
            const Countries = ORM.model('trs_tbl_countries');
            const States = ORM.model('trs_tbl_states');
            return Drivers.findAndCountAll({
                order: orderBy, where: queryWhere
                , include: [
                    { model: DriverDocs, where: { 'is_deleted': 0 }, on: { '$trs_tbl_drivers.driver_id$': { '$col': 'trs_tbl_driver_documents.driver_id' } }, required: false },
                    { model: States, where: stateWhere, on: { '$trs_tbl_drivers.state_id$': { '$col': 'trs_tbl_state.state_id' } } },
                    { model: Countries, where: countryWhere, on: { '$trs_tbl_drivers.country_id$': { '$col': 'trs_tbl_country.country_id' } } },
                ]
            }).then(roles => {
                return resolve({ success: true, results: roles.rows, count: roles.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.updateDriverComments = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driver_id) {
                return reject({ success: false, message: "Invalid params" });
            }
            if (data.from) {
                data.driver_id = parseInt(functions.decrypt(data.driver_id));
                delete data.from;
                data.driver_profoile_pic_url = null;
                req.session.userId = '2b';
            }
            const Drivers = ORM.model('trs_tbl_drivers');
            let queryWhere = { 'driver_id': data.driver_id };
            return Drivers.findOne({ where: queryWhere }).then(roles => {
                if (roles) {
                    delete data.driver_id;
                    for (let key in data) {
                        roles[key] = data[key];
                    }
                    return roles.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(lookups => {
                        return resolve({ success: true });
                    }).catch(error => {
                        console.log(error);
                        return reject({ success: false, message: "Something went wrong" });
                    });
                }
                else {
                    return reject({ success: false, message: "Driver not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.updateDriver = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let finalItems = [];
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({ success: false, message: err.message });
                }
                let infoObject = JSON.parse(fields.driverInfo);
                let docsObject = JSON.parse(fields.documentsData);
                if (!infoObject.driver_id) {
                    return reject({ success: false, message: "Invalid params" });
                }
                for (let i = 0; i < infoObject.docsLength; i++) {
                    let filestream = fs.createReadStream(files['filesnew' + i].path);
                    let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew' + i].name.split(' ').join('_')
                    let params = { Bucket: "permishare/dev/driver-documents", Key: namesToUpload, Body: filestream, ACL: "public-read" };
                    let data = await uploadFile(params);
                    if (data.success)
                        fileLocationInBucket.push(data.path);
                    fileNameInBucket.push(data.name);
                }
                const Drivers = ORM.model('trs_tbl_drivers');
                const DriverDocs = ORM.model('trs_tbl_driver_documents');
                let queryWhere = { 'is_deleted': 0 };
                queryWhere = { "driver_id": infoObject.driver_id };
                if (infoObject.driver_id) {
                    let NotificationCount = 0;
                    for (let i = 0; i < infoObject.docsLength; i++) {
                        var item = {};
                        if (docsObject[i].appAccess)
                            NotificationCount++;
                        item = { "driver_id": infoObject.driver_id, "document_name": docsObject[i].docRef, "app_access": docsObject[i].appAccess, "document_originalname": fileNameInBucket[i], "document_type": docsObject[i].docType, "document_s3_url": fileLocationInBucket[i], "issue_date": docsObject[i].issueDate, "exp_date": docsObject[i].expiryDate, "created_by": functions.decrypt(req.session.userId), "modified_by": functions.decrypt(req.session.userId), "carrier_id": infoObject.carrier_id };
                        finalItems.push(item);
                    }
                    if (NotificationCount) {
                        let sendDriverNotification = await notifyDrivers(infoObject.carrier_id, infoObject.notification_message, infoObject.driver_id);
                        if (!sendDriverNotification.success)
                            return reject({ success: false, message: "Something went wrong" });
                    }
                }
                delete infoObject.notification_message;
                DriverDocs.bulkCreate(finalItems, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateRes => {
                    Drivers.findOne({ where: queryWhere }).then(campaign => {
                        if (campaign) {
                            delete infoObject.driver_id;
                            for (let key in infoObject) {
                                campaign[key] = infoObject[key];
                            }
                            return campaign.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                                return resolve({ "success": true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        } else {
                            return reject({ "success": false, "message": "Driver not found" });
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ "success": false, "message": "Something went wrong" });
                    })
                }).catch(err => {
                    console.log(err);
                    return reject({ "success": false, "message": "Something went wrong" });
                })
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.addNewDriverDocuments = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let finalItems = [];
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({ success: false, message: err.message });
                }
                let infoObject = JSON.parse(fields.driverInfo);
                let docsObject = JSON.parse(fields.documentsData);
                if (!infoObject.driver_id) {
                    return reject({ success: false, message: "Invalid params" });
                }
                for (let i = 0; i < infoObject.docsLength; i++) {
                    let filestream = fs.createReadStream(files['filesnew' + i].path);
                    let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew' + i].name.split(' ').join('_')
                    let params = { Bucket: "permishare/dev/driver-documents", Key: namesToUpload, Body: filestream, ACL: "public-read" };
                    let data = await uploadFile(params);
                    if (data.success)
                        fileLocationInBucket.push(data.path);
                    fileNameInBucket.push(data.name);
                }
                const assets = ORM.model('trs_tbl_drivers');
                const assetsDocs = ORM.model('trs_tbl_driver_documents');
                let queryWhere = { 'is_deleted': 0 };
                queryWhere = { "driver_id": infoObject.driver_id };
                if (infoObject.driver_id) {
                    let NotificationCount = 0;
                    for (let i = 0; i < infoObject.docsLength; i++) {
                        var item = {};
                        if (docsObject[i].appAccess)
                            NotificationCount++
                        item = { "driver_id": infoObject.driver_id, "document_name": docsObject[i].docRef, "document_originalname": fileNameInBucket[i], "app_access": docsObject[i].appAccess, "document_type": docsObject[i].docType, "document_s3_url": fileLocationInBucket[i], "issue_date": docsObject[i].issueDate, "exp_date": docsObject[i].expiryDate, "created_by": functions.decrypt(req.session.userId), "modified_by": functions.decrypt(req.session.userId), "carrier_id": infoObject.carrier_id };
                        finalItems.push(item);
                    }
                    if (NotificationCount) {
                        let sendDriverNotification = await notifyDrivers(infoObject.carrier_id, infoObject.notification_message, infoObject.driver_id);
                        if (!sendDriverNotification.success)
                            return reject({ success: false, message: "Something went wrong" });
                    }
                }
                assetsDocs.bulkCreate(finalItems, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateRes => {
                    assets.findOne({ where: queryWhere }).then(campaign => {
                        if (campaign) {
                            delete infoObject.driver_id;
                            delete infoObject.notification_message;
                            // delete infoObject.carrier_id;
                            for (let key in infoObject) {
                                campaign[key] = infoObject[key];
                            }
                            return campaign.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                                return resolve({ "success": true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        } else {
                            return reject({ "success": false, "message": "Asset not found" });
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ "success": false, "message": "Something went wrong" });
                    })
                }).catch(err => {
                    console.log(err);
                    return reject({ "success": false, "message": "Something went wrong" });
                })
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.addNewDriverDocument = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let arrayOfFiles = 0;
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({ success: false, message: err.message });
                }
                let infoObject = JSON.parse(fields.documentData);
                let filestream = fs.createReadStream(files.fileKey.path);
                let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files.fileKey.name.split(' ').join('_')
                let params = { Bucket: "permishare/dev/driver-documents", Key: namesToUpload, Body: filestream, ACL: "public-read" };
                let data = await uploadFile(params);
                if (data.success)
                    fileLocationInBucket.push(data.path);
                fileNameInBucket.push(data.name);
                infoObject['document_name'] = fileLocationInBucket[0];
                infoObject['document_originalname'] = fileNameInBucket[0];
                // const CorporateInformation = ORM.model('trs_tbl_corporate_information');
                // const CorporateInformationDocuments = ORM.model('trs_tbl_corporate_info_documents');
                // const Drivers = ORM.model('trs_tbl_drivers');
                const DriverDocs = ORM.model('trs_tbl_driver_documents');
                return DriverDocs.create(infoObject, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(caseRegistered => {
                    if (caseRegistered) {
                        return resolve({ success: true });
                    }
                    else {
                        return reject({ success: false, message: "Something went wrong" });
                    }
                }).catch(error => {
                    console.log(error);
                    return reject({ success: false, message: "Something went wrong" });
                });

            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

// exports.addNewDriverDocuments = function(req) {
//     return new Promise(async function(resolve,reject) {
//         try {
//             var fileLocationInBucket = [];
//             let arrayOfFiles = 0;
//             var form = new formidable.IncomingForm();
//             form.parse(req, async function(err, fields, files) {
//                 if (err) {
//                     console.error(err.message);
//                     return reject({success:false , message:err.message});
//                 }
//                 for(let i = 0; i < infoObject.docsLength;i++) {
//                     let filestream = fs.createReadStream(files['filesnew'+i].path);
//                     let namesToUpload = files['filesnew'+i].name.split(' ').join('_')
//                     let params = {Bucket:"permishare/dev/driver-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
//                     let data = await uploadFile(params);
//                     if(data.success) 
//                     fileLocationInBucket.push(data.path);
//                 }
//                 console.log(fileLocationInBucket);
//                 infoObject['document_name'] = fileLocationInBucket[0];
//                 const DriverDocs = ORM.model('trs_tbl_driver_documents');
//                 return DriverDocs.create(infoObject,{"validate":true , "userId":1}).then(caseRegistered => {
//                     if(caseRegistered) {
//                         return resolve({success:true});
//                     }
//                     else {
//                         return reject({success:false , message:"Something went wrong"});
//                     }
//                 }).catch(error => {
//                     console.log(error);
//                     return reject({success:false , message:"Something went wrong"});
//                 });

//             });
//         }
//         catch(err) {
//             console.log(err);
//             return reject({success:false , message:"Something went wrong"});
//         }
//     });
// }

exports.getCorporateInfo = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;

            let queryWhere = {};
            queryWhere['carrier_id'] = data.carrier_id;
            //queryWhere['is_deleted'] = 0;
            if ("driver_first_name" in data) {
                queryWhere['driver_first_name'] = { $like: '%' + data.driver_first_name + '%' };
            }
            if ("driver_last_name" in data) {
                queryWhere['driver_last_name'] = { $like: '%' + data.driver_last_name + '%' };
            }
            if ("dl_class" in data) {
                queryWhere['dl_class'] = { $like: '%' + data.dl_class + '%' };
            }
            if ("city" in data) {
                queryWhere['city'] = { $like: '%' + data.city + '%' };
            }
            if ("dl_number" in data) {
                queryWhere['dl_number'] = { $like: '%' + data.dl_number + '%' };
            }
            if ("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            if ("country_id" in data) {
                countryWhere["country_id"] = data.country_id;
            }
            if ("state_id" in data) {
                stateWhere["state_id"] = data.state_id;
            }
            const Corporate = ORM.model('trs_tbl_corporate_information');
            const CorpDocs = ORM.model('trs_tbl_corporate_info_documents');
            const Countries = ORM.model('trs_tbl_countries');
            const States = ORM.model('trs_tbl_states');
            // const Permissions = ORM.model('trs_tbl_permissions');
            return Corporate.findAndCountAll({
                where: queryWhere
                , include: [
                    { model: CorpDocs, required: false, where: { 'is_deleted': 0 }, on: { '$trs_tbl_corporate_information.corporate_information_id$': { '$col': 'trs_tbl_corporate_info_documents.corporate_information_id' } } },
                    { model: States, on: { '$trs_tbl_corporate_information.state_id$': { '$col': 'trs_tbl_state.state_id' } } },
                    { model: Countries, on: { '$trs_tbl_corporate_information.country_id$': { '$col': 'trs_tbl_country.country_id' } } },
                ]
            }).then(roles => {
                // console.log(roles.rows);
                return resolve({ success: true, results: roles.rows, count: roles.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.updateCorporateInformation = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.corporate_information_id) {
                return reject({ success: false, message: "Invalid params" });
            }
            const CorporateInformation = ORM.model('trs_tbl_corporate_information');
            let queryWhere = { 'corporate_information_id': data.corporate_information_id };
            return CorporateInformation.findOne({ where: queryWhere }).then(roles => {
                if (roles) {
                    delete data.corporate_information_id;
                    for (let key in data) {
                        roles[key] = data[key];
                    }
                    return roles.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(lookups => {
                        return resolve({ success: true });
                    }).catch(error => {
                        console.log(error);
                        return reject({ success: false, message: "Something went wrong" });
                    });
                }
                else {
                    return reject({ success: false, message: "Corporate Information not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.updateDriverDocuments = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.document_id) {
                return reject({ success: false, message: "Invalid params" });
            }
            const Documents = ORM.model('trs_tbl_driver_documents');
            let queryWhere = { "document_id": { $in: [data.document_id] } };
            return Documents.findOne({ where: queryWhere }).then(async idea => {
                if (idea) {
                    if (data.app_access) {
                        let sendDriverNotification = await notifyDrivers(data.carrier_id, data.notification_message, data.driver_id);
                        if (sendDriverNotification.success) {
                            delete data.carrier_id;
                            delete data.driver_id;
                            delete data.notification_message;
                            for (let key in data) {
                                idea[key] = data[key];
                            }
                            return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                                return resolve({ "success": true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        }
                        else {
                            return reject({ success: false, message: "Something went wrong" });
                        }
                    }
                    else {
                        delete data.carrier_id;
                        delete data.notification_message;
                        for (let key in data) {
                            idea[key] = data[key];
                        }
                        return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                            return resolve({ "success": true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    }
                } else {
                    return reject({ success: false, message: "Category not found" });
                }
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


exports.getAllDrivers = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.carrier_id)
                return reject({ success: false, message: "Carrier ID is missing" });
            let queryWhere = {};
            let stateWhere = {};
            let countryWhere = {};
            let orderBy = [];
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id;
            if ("driver_first_name" in data) {
                queryWhere['driver_first_name'] = { $like: '%' + data.driver_first_name + '%' };
            }
            if ("a-z" in data) {
                orderBy = [["driver_last_name", "asc"]];
            }
            if ("z-a" in data) {
                orderBy = [["driver_last_name", "desc"]];
            }
            if ("driver_last_name" in data) {
                queryWhere['driver_last_name'] = { $like: '%' + data.driver_last_name + '%' };
            }
            if ("dl_class" in data) {
                queryWhere['dl_class'] = { $like: '%' + data.dl_class + '%' };
            }
            if ("city" in data) {
                queryWhere['city'] = { $like: '%' + data.city + '%' };
            }
            if ("dl_number" in data) {
                queryWhere['dl_number'] = { $like: '%' + data.dl_number + '%' };
            }
            if ("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            if ("country_id" in data) {
                countryWhere["country_id"] = data.country_id;
            }
            if ("state_id" in data) {
                stateWhere["state_id"] = data.state_id;
            }
            const Drivers = ORM.model('trs_tbl_drivers');
            const DriverDocs = ORM.model('trs_tbl_driver_documents');
            const Countries = ORM.model('trs_tbl_countries');
            const States = ORM.model('trs_tbl_states');
            return Drivers.findAndCountAll({
                order: orderBy, where: queryWhere
                , include: [
                    { model: DriverDocs, required: false, where: { 'is_deleted': 0 }, on: { '$trs_tbl_drivers.driver_id$': { '$col': 'trs_tbl_driver_documents.driver_id' } }, required: false },
                    { model: States, where: stateWhere, on: { '$trs_tbl_drivers.state_id$': { '$col': 'trs_tbl_state.state_id' } } },
                    { model: Countries, where: countryWhere, on: { '$trs_tbl_drivers.country_id$': { '$col': 'trs_tbl_country.country_id' } } },
                ]
            }).then(roles => {
                return resolve({ success: true, results: roles.rows, count: roles.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.deleteCoroperateDoc = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            // if(!data.document_id) {
            //     return reject({success:false , message:"Invalid params"});
            // }
            const Documents = ORM.model('trs_tbl_corporate_info_documents');
            let queryWhere = {};
            if (data.from)
                queryWhere = { "document_id": { $in: [data.document_id] } };
            else
                queryWhere = { "corporate_information_id": { $in: [data.corporate_information_id] } };
            if (data.from) {
                return Documents.findOne({ where: queryWhere }).then(async idea => {
                    if (idea) {
                        if (data.app_access) {
                            let sendDriverNotification = await notifyDrivers(data.carrier_id, data.notification_message, 0);
                            if (sendDriverNotification.success) {
                                delete data.carrier_id;
                                delete data.notification_message;
                                for (let key in data) {
                                    idea[key] = data[key];
                                }
                                return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                                    return resolve({ "success": true });
                                }).catch(err => {
                                    console.log(err);
                                    return reject({ success: false, message: 'Something went wrong' });
                                });
                            }
                            else {
                                return reject({ success: false, message: "Something went wrong" });
                            }
                        }
                        else {
                            delete data.carrier_id;
                            delete data.notification_message;
                            for (let key in data) {
                                idea[key] = data[key];
                            }
                            return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                                return resolve({ "success": true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        }
                    } else {
                        return reject({ success: false, message: "Category not found" });
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: 'Something went wrong' });
                });
            }
            else {
                return Documents.findAll({ where: queryWhere }).then(idea => {
                    if (idea) {
                        console.log(idea);
                        let finalArray = [];
                        idea.forEach(element => {
                            let elements = element.get({ plain: true });
                            // console.log(elements);
                            elements['is_deleted'] = 1;
                            finalArray.push(elements);
                        });
                        Documents.bulkCreate(finalArray, { updateOnDuplicate: ['is_deleted'] }).then(data => {
                            return resolve({ success: true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        })
                        // for (let key in data) {
                        //     idea[key] = data[key];
                        // }
                        // return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                        //     return resolve({ "success": true });
                        // }).catch(err => {
                        //     console.log(err);
                        //     return reject({ success: false, message: 'Something went wrong' });
                        // });
                    } else {
                        return reject({ success: false, message: "Category not found" });
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: 'Something went wrong' });
                });
            }
        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

async function notifyDrivers(carrierId, NotificationMessage, from) {
    return new Promise(async function (resolve, reject) {
        try {
            if (!carrierId) {
                return { success: false, message: "Invalid parameters" };
            }
            if (from) {
                let addRecordInNotificationTable = await addNoitificationRecord(carrierId, NotificationMessage, from);
                if (addRecordInNotificationTable.success) {
                    const Drivers = ORM.model('trs_tbl_drivers');
                    var FireBaseIds = [];
                    let driverDoc = await Drivers.findAll({ where: { "driver_id": from } });
                    if (driverDoc.length) {
                        for (let i = 0; i < driverDoc.length; i++) {
                            driverDoc[i] = driverDoc[i].get({ plain: true });
                            if (driverDoc[i].driver_firebase_id && driverDoc[i].driver_firebase_id != '')
                                FireBaseIds.push(driverDoc[i].driver_firebase_id);
                        }

                        // let message = "You have new corporate documents to download."
                        if (FireBaseIds.length) {
                            var notificationObj = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                registration_ids: FireBaseIds,
                                //collapse_key: 'your_collapse_key',

                                notification: {
                                    title: 'PermiShare',
                                    body: NotificationMessage,
                                    sound: 'default'
                                },

                                data: { //you can send only notification or only data(or include both)
                                    title: 'PermiShare',
                                    body: NotificationMessage,
                                    sound: 'default'
                                }
                            }
                            driverFCM.send(notificationObj, function (err, response) {
                                if (err) {
                                    console.log("Something went wrong!", err);
                                    return reject({ success: false, message: "Something went wrong" });
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                    return resolve({ success: true, message: "Successful", result: response });
                                }
                            });
                        }
                        else {
                            return resolve({ success: true })
                        }


                    } else {
                        return reject({ success: false, message: "Driver not found" });
                    }
                }
                else {
                    return reject({ success: false, message: "Something went wrong" });
                }
            }
            else {
                let addRecordInNotificationTable = await addNoitificationRecord(carrierId, NotificationMessage);
                if (addRecordInNotificationTable.success) {
                    const Drivers = ORM.model('trs_tbl_drivers');
                    var FireBaseIds = [];
                    let driverDoc = await Drivers.findAll({ where: { "carrier_id": carrierId, 'is_deleted': 0, 'is_active': 1 } });
                    if (driverDoc.length) {
                        for (let i = 0; i < driverDoc.length; i++) {
                            driverDoc[i] = driverDoc[i].get({ plain: true });
                            if (driverDoc[i].driver_firebase_id && driverDoc[i].driver_firebase_id != '')
                                FireBaseIds.push(driverDoc[i].driver_firebase_id);
                        }

                        // let message = "You have new corporate documents to download."
                        if (FireBaseIds.length) {
                            var notificationObj = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                registration_ids: FireBaseIds,
                                //collapse_key: 'your_collapse_key',

                                notification: {
                                    title: 'PermiShare',
                                    body: NotificationMessage,
                                    sound: 'default'
                                },

                                data: { //you can send only notification or only data(or include both)
                                    title: 'PermiShare',
                                    body: NotificationMessage,
                                    sound: 'default'
                                }
                            }
                            driverFCM.send(notificationObj, function (err, response) {
                                if (err) {
                                    console.log("Something went wrong!", err);
                                    return reject({ success: false, message: "Something went wrong" });
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                    return resolve({ success: true, message: "Successful", result: response });
                                }
                            });
                        }
                        else {
                            return resolve({ success: true })
                        }


                    } else {
                        return resolve({ success: true });
                    }
                }
                else {
                    return reject({ success: false, message: "Something went wrong" });
                }
            }

        } catch (error) {
            console.log(error);
            return reject({ "success": false, "message": "Something went wrong" });
        }
    })

}

function addNoitificationRecord(id, message, driver) {
    return new Promise(function (resolve, reject) {
        try {
            let finalObj = {};
            finalObj['app_notification_message'] = message;
            finalObj['carrier_id'] = id;
            if (driver)
                finalObj['driver_id'] = driver;
            let date = new Date();
            let date2 = new Date(date);
            finalObj['created_date'] = date2.setMinutes(date.getMinutes() - 240);
            const Notifications = ORM.model('trs_tbl_app_notifications');
            return Notifications.create(finalObj).then(recordAdded => {
                return resolve({ success: true });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.addBulkDrivers = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            // if(!data.email_address || !data.driver_first_name || !data.driver_last_name || !data.cell_phone || !data.dl_number || !data.dl_class || !data.address1 || !data.city || !data.country_id || !data.state_id || !data.start_date)
            // return reject({ success: false, message: 'Invalid params' });
            const Drivers = ORM.model('trs_tbl_drivers');
            let queryWhere = { 'is_deleted': 0, 'is_active': 1 };
            queryWhere['carrier_id'] = { $notIn: [data[0].carrier_id] };
            return Drivers.findAndCountAll({ where: queryWhere, attributes: ['email_address'] }).then(driverData => {
                if (driverData.rows.length) {
                    let finalArray = [];
                    driverData.rows.forEach(element => {
                        element = element.get({ plain: true });
                        for (let j = 0; j < data.length; j++) {
                            if (element.email_address == data[j].email_address) {
                                finalArray.push(element.email_address);
                            }
                        }
                    })
                    if (finalArray.length) {
                        return reject({ success: false, message: "One or more drivers in the document are active at other carriers.Please contact admin" });
                    }
                    else {
                        Drivers.bulkCreate(data, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                            return resolve({ "success": true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    }
                }
                else {
                    Drivers.bulkCreate(data, { "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                        return resolve({ "success": true });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.getStatesForCanadaAndUsa = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_active'] = 1;
            queryWhere['country_id'] = { $in: [38, 231] };
            const States = ORM.model('trs_tbl_states');
            return States.findAndCountAll({ where: queryWhere }).then(states => {
                return resolve({ success: true, results: states.rows, count: states.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.updateGridColumns = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.carrier_id) {
                return reject({ success: false, message: "Invalid params" });
            }
            const DriversGrids = ORM.model('trs_tbl_driver_grid_columns');
            let queryWhere = { 'carrier_id': data.carrier_id };
            return DriversGrids.findOne({ where: queryWhere }).then(roles => {
                if (roles) {
                    delete data.driver_grid_column_id;
                    for (let key in data) {
                        // console.log(data[key]);
                        roles[key] = data[key];
                    }
                    return roles.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(lookups => {
                        return resolve({ success: true });
                    }).catch(error => {
                        console.log(error);
                        return reject({ success: false, message: "Something went wrong" });
                    });
                }
                else {
                    return reject({ success: false, message: "Driver not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.getGridColumns = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = { 'carrier_id': data.carrier_id };
            const DriversGrids = ORM.model('trs_tbl_driver_grid_columns');
            return DriversGrids.findAndCountAll({ where: queryWhere }).then(states => {
                return resolve({ success: true, results: states.rows, count: states.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (err) {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.authenticateDriver = function (req) {
    try {
        let data = req.body;
        if (!data.email || !data.password)
            return { auth: false, message: 'Invalid params' };
        const Driver = ORM.model('trs_tbl_drivers');
        const DriverDocx = ORM.model('trs_tbl_driver_documents');
        // const RightMaster = ORM.model('trs_tbl_right_master');
        // const Roles = ORM.model('trs_tbl_roles');
        const Carriers = ORM.model('trs_tbl_carriers');
        const Assets = ORM.model('trs_tbl_assets');
        // let requiredFields = ["driver_first_name","driver_last_name","cell_phone","email_address","carrier_id","inactive_date","current_active_asset_id","dl_number","is_deleted","user_type","carrier_id"];
        return Driver.findAll(
            {
                where: { "email_address": data.email, "is_deleted": 0 },
                include: [
                    { model: DriverDocx, where: { 'is_deleted': 0, 'app_access': 1 }, on: { '$trs_tbl_drivers.driver_id$': { '$col': 'trs_tbl_driver_documents.driver_id' } }, required: false },
                    { model: Carriers, on: { '$trs_tbl_drivers.carrier_id$': { '$col': 'trs_tbl_carrier.carrier_id' } } },
                    { model: Assets, required: false, where: { 'is_deleted': 0, 'is_active': 1 }, on: { '$trs_tbl_drivers.current_active_asset_id$': { '$col': 'trs_tbl_asset.asset_id' } } }
                ]
            }
        ).then(async userdata => {
            if (userdata.length !== 0) {
                if (!userdata[0].is_verified)
                    return { auth: false, message: 'Activation link was sent to this email. Please verify your identity.' };
                if (!bcrypt.compareSync(data.password, userdata[0].password))
                    return { auth: false, message: 'Invalid Username or Password' };
                if (!userdata[0].is_active)
                    return { auth: false, message: 'Driver not active. Please contact admin' };
                if (!userdata[0].trs_tbl_carrier.is_active)
                    return { auth: false, message: "Subscription plan was cancelled for this carrier" };
                if (userdata[0].trs_tbl_carrier.conversion_token)
                    return { auth: false, message: "Payment link was sent to this email. Please pay for your package" };
                let dId = functions.encrypt(userdata[0].driver_id.toString());
                let rmd = functions.randomValueBase64(20);
                let accessToken = functions.encrypt(rmd);
                let temp = userdata[0].get({ plain: true });
                let asset = null;
                req.session.driverId = dId;
                req.session.driverToken = accessToken;
                req.session.from = 'mobile';
                // if(userdata[0].trs_tbl_asset.length)
                // asset = userdata[0].trs_tbl_asset;
                // req.session.userpermissions = userdata[0].trs_tbl_role.trs_tbl_permissions;
                return { auth: true, pro_pic: userdata[0].driver_profoile_pic_url, carrier_name: userdata[0].trs_tbl_carrier.carrier_name, token: accessToken, driverId: dId, carrierId: userdata[0].carrier_id, driverFirstName: userdata[0].driver_first_name, driverLastName: userdata[0].driver_last_name, phone: userdata[0].cell_phone, emailId: userdata[0].email_address, documentData: userdata[0].trs_tbl_driver_documents, myActiveAsset: userdata[0].trs_tbl_asset, company_name: userdata[0].trs_tbl_carrier.company_name };
            } else {
                return { auth: false, message: 'Driver not found' };
            }
        }).catch(err => {
            console.log(err);
            return { auth: false, message: 'Something went wrong' };
        });
    } catch (err) {
        console.log(err);
        return { auth: false, message: 'Something went wrong' };
    }
}

exports.makeAssetActiveInMobileApp = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driverId || !data.AssetId)
                return reject({ success: false, message: "Invalid params" });
            const Driver = ORM.model('trs_tbl_drivers');
            const History = ORM.model('trs_tbl_driver_asset_history');
            let item = { "driver_id": functions.decrypt(data.driverId), "asset_id": data.AssetId, "date": data.date, "carrier_id": data.carrier_id };
            return Driver.findOne({ where: { 'driver_id': functions.decrypt(data.driverId) } }).then(driverDataFound => {
                if (driverDataFound) {
                    if (driverDataFound.current_active_asset_id) {
                        return reject({ success: false, message: "An asset is currently active. Please unselect the asset first then try again" });
                    }
                    else {
                        ORM.getObj().transaction().then(function (t) {
                            driverDataFound['current_active_asset_id'] = data.AssetId;
                            return driverDataFound.save({ "validate": true, "userId": '2b', "transaction": t }).then(receivedData => {
                                return History.create(item, { "validate": true, "transaction": t }).then(doneData => {
                                    t.commit();
                                    return resolve({ success: true, message: "Asset set as actve asset" });
                                }).catch(err => {
                                    console.log(err);
                                    return reject({ success: false, message: "Something went wrong" });
                                })
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: "Something went wrong" });
                            })
                        })
                    }
                }
                else {
                    return reject({ success: false, message: "Driver not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.getDriverCurrentAssetId = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driverId)
                return reject({ success: false, message: "Invalid params" });
            const Driver = ORM.model('trs_tbl_drivers');
            return Driver.findOne({ where: { 'driver_id': functions.decrypt(data.driverId) } }).then(driverDataFound => {
                if (driverDataFound) {
                    if (driverDataFound.current_active_asset_id) {
                        return resolve({ success: true, current_active_asset_id :  driverDataFound.current_active_asset_id});
                    }
                    else {
                        return reject({ success: false, message: "No Active Asset" });
                    }
                }
                else {
                    return reject({ success: false, message: "Driver not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.makeAssetInActiveAsUnselectInMobileApp = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driverId)
                return reject({ success: false, message: "Invalid params" });
            const Driver = ORM.model('trs_tbl_drivers');
            const History = ORM.model('trs_tbl_driver_asset_history');
            // let item = {"driver_id":functions.decrypt(data.driverId),"asset_id":null,"date":data.date,"carrier_id":data.carrier_id};
            // console.log(item)
            return Driver.findOne({ where: { 'driver_id': functions.decrypt(data.driverId) } }).then(driverDataFound => {
                if (driverDataFound) {
                    ORM.getObj().transaction().then(function (t) {
                        driverDataFound['current_active_asset_id'] = null;
                        return driverDataFound.save({ "validate": true, "userId": '2b' }).then(receivedData => {
                            return History.findOne({ where: { 'driver_id': functions.decrypt(data.driverId) }, order: [['asset_history_id', 'DESC']], limit: 1 }).then(doneData => {
                                if (doneData) {
                                    doneData['to_date'] = data.date;
                                    return doneData.save({ "validate": true, "userId": '2b' }).then(yesRecordSaved => {
                                        t.commit();
                                        return resolve({ success: true, message: "Asset removed as active asset" });
                                    }).catch(err => {
                                        console.log(err);
                                        return reject({ success: false, message: "Something went wrong" });
                                    })
                                }
                                else {
                                    return reject({ success: false, message: "Record not found" });
                                }
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: "Something went wrong" });
                            })
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        })
                    })
                }
                else {
                    return reject({ success: false, message: "Driver not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.getCorporateDocsForMobile = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.carrierId)
                return reject({ success: false, message: "Invalid params" });
            const CorporateInfo = ORM.model('trs_tbl_corporate_information');
            const corpInfoDocs = ORM.model('trs_tbl_corporate_info_documents');
            return CorporateInfo.findOne({
                where: { 'carrier_id': data.carrierId }, include: [
                    { model: corpInfoDocs, required: false, where: { 'is_deleted': 0, 'app_access': 1 },on: { '$trs_tbl_corporate_information.corporate_information_id$': { '$col': 'trs_tbl_corporate_info_documents.corporate_information_id' } } },
                ],
                order: [
                    [{model: corpInfoDocs},"document_name", "asc"]
                  ],
            }).then(corDataForMobile => {
                // console.log(corDataForMobile);
                let element = corDataForMobile.get({ plain: true });
                return resolve({ success: true, result: element.trs_tbl_corporate_info_documents });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.sendDriverPasswordLink = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            // let packId = data.package_id;
            // var convPackage = functions.encrypt(packId.toString());
            const Drivers = ORM.model('trs_tbl_drivers');
            var accessToken = functions.randomValueBase64(20);
            let hash = bcrypt.hashSync(accessToken, 10);
            var token = functions.encrypt(accessToken);
            var dId = functions.encrypt(data.driver_id.toString());
            var url = originurl + '/#/driververification?did=' + dId + '&activationToken=' + token;
            var email = data.email_address;
            let sending_email = await getSendingEmail(data.carrier_id);
            let email_res = await sendActivationEmail(url, email, data.driver_first_name + ' ' + data.driver_last_name, sending_email.value, null);
            // let email_res = await sendActivationEmail(url, email, data.driver_first_name + ' ' + data.driver_last_name, sending_email.value, null);
            // var email = data.carrier_email;
            data.password = hash;
            data.password_reset_token = hash;
            // var sending_email = await getSendingEmailForConversion(data.carrier_id);
            // data.conversion_token = token;
            // data.request_from = 0;
            // var email_res = await sendConversionEmail(url, email, data.carrier_name,sending_email.value);
            return Drivers.findOne({ where: { 'driver_id': data.driver_id } }).then(carr => {
                if (carr) {
                    delete data.driver_id;
                    for (let key in data) {
                        carr[key] = data[key];
                    }
                    return carr.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(savedData => {
                        if (email_res.success)
                            return resolve({ success: true });
                        else
                            return reject({ success: false });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: "Something went wrong" });
                    })
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.logoutDriver = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driver_id) {
                return reject({ success: false, message: "Invalid params" });
            }
            const Drivers = ORM.model('trs_tbl_drivers');
            return Drivers.findOne({ where: { 'driver_id': functions.decrypt(data.driver_id) } }).then(driverRecord => {
                driverRecord['driver_firebase_id'] = null;
                return driverRecord.save({ 'validate': true, 'userId': '2b' }).then(recordUpdated => {
                    return resolve({ success: true });
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: "Something went wrong" });
                })
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.getDriverDocxForMobileApp = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driver_id) {
                return reject({ success: false, message: "Invalid params" });
            }
            data.driver_id = functions.decrypt(data.driver_id);
            const DriverDocx = ORM.model('trs_tbl_driver_documents');
            let queryWhere = {};
            queryWhere['driver_id'] = data.driver_id;
            queryWhere['is_deleted'] = 0;
            queryWhere['app_access'] = 1;
            let orderBy = [["document_name", "asc"]];
            return DriverDocx.findAndCountAll({ where: queryWhere,order: orderBy, }).then(driverDocumentData => {
                return resolve({ success: true, results: driverDocumentData.rows });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.getAppNotifications = function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.carrier_id || !data.driver_id) {
                return reject({ success: false, message: "Something went wrong" });
            }
            OrderBy = [["app_notification_id", "DESC"]];
            const Notifications = ORM.model('trs_tbl_app_notifications');
            return Notifications.findAndCountAll({ where: { 'carrier_id': data.carrier_id }, order: OrderBy }).then(notData => {
                if (notData.rows.length) {
                    let FinalArray = [];
                    notData.rows.forEach(element => {
                        element = element.get({ plain: true });
                        if (element.driver_id) {
                            if (element.driver_id == functions.decrypt(data.driver_id)) {
                                FinalArray.push(element);
                            }
                        }
                        else {
                            FinalArray.push(element);
                        }
                    })
                    return resolve({ success: true, results: FinalArray });
                }
                else {
                    return resolve({ success: true, results: [] });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}