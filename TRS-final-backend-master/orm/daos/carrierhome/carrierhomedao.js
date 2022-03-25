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
var originServerUrl = config[param+'Serv'];
const winston = require('winston');
var formidable = require('formidable');
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.getCorpInfo = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {'carrier_id':data.carrier_id};
            //queryWhere['is_deleted'] = 0;
            const Corporate = ORM.model('trs_tbl_corporate_information');
            const CorpDocs = ORM.model('trs_tbl_corporate_info_documents');
            const Countries = ORM.model('trs_tbl_countries');
            const States = ORM.model('trs_tbl_states');
            // console.log(queryWhere);
            // const Permissions = ORM.model('trs_tbl_permissions');
            return Corporate.findAndCountAll({where:queryWhere
                ,include:[
                    {model:CorpDocs ,required:false,where: { 'is_deleted': 0 }, on:{'$trs_tbl_corporate_information.corporate_information_id$' : {'$col':'trs_tbl_corporate_info_documents.corporate_information_id'}}},
                    {model:States , on:{'$trs_tbl_corporate_information.state_id$' : {'$col':'trs_tbl_state.state_id'}}},
                    {model:Countries , on:{'$trs_tbl_corporate_information.country_id$' : {'$col':'trs_tbl_country.country_id'}}},
                ]
            }).then(roles => {
                return resolve({success:true , results:roles.rows , count:roles.count});
            }).catch(err => {
                console.log(err);
                return reject({success:false,message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false,message:"Something went wrong"});
        }
    });
}

exports.getDriverDocuments = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            const Alerts = ORM.model('trs_tbl_home_alerts');
            let data = req.body;
            let finalArray = [];
            let returnFromDriverDocx = await getDriversDocuments(data.carrier_id);
            let resultOfReturnFromDriverDocx = returnFromDriverDocx.results;
            // console.log(returnFromDriverDocx);
            let firstConcat = finalArray.concat(resultOfReturnFromDriverDocx);
            // console.log(firstConcat);
            let returnFromAssetsDocx = await getAssetsDocuments(data.carrier_id);
            let resultOfReturnFromAssetsDocx = returnFromAssetsDocx.results;
            let assetContact = firstConcat.concat(resultOfReturnFromAssetsDocx);
            let returnFromIrsDocx = await getIRSDocuments(data.carrier_id);
            let resultOfReturnFromIrsDocx = returnFromIrsDocx.results;
            let secondConcat = assetContact.concat(resultOfReturnFromIrsDocx);
            let returnFromIFTADocx = await getIFTADocuments(data.carrier_id);
            let resultOfReturnFromIFTADocx = returnFromIFTADocx.results;
            let thirdConcat = secondConcat.concat(resultOfReturnFromIFTADocx);
            let returnFromIRPDocx = await getIRPDocuments(data.carrier_id);
            let resultOfReturnFromIRPDocx = returnFromIRPDocx.results;
            let fourthConcat = thirdConcat.concat(resultOfReturnFromIRPDocx);
            let returnFromCorporateDocx = await getCorporateDocuments(data.carrier_id);
            let resultOfReturnFromCorporateDocx = returnFromCorporateDocx.results;
            let fifthConcat = fourthConcat.concat(resultOfReturnFromCorporateDocx);
            fifthConcat.sort(function(a, b) {
                var titleA = a.difference, titleB = b.difference;
                if (titleA < titleB) return -1; 
                if (titleA > titleB) return 1;
                return 0;
            });
            return resolve({success:true , results:fifthConcat});
            let insertingIntoTable = await InsertIntoTable(fifthConcat,data.carrier_id);
            // console.log(insertingIntoTable.success,"Yes");
            if(insertingIntoTable.success) {
                return Alerts.findAndCountAll({where:{'is_deleted':0,"carrier_id":data.carrier_id}}).then(alert => {
                    return resolve({success:true , results:alert.rows});
                })
            }
            // return resolve({success:true , results:fifthConcat});
        }
        catch(error) {
            console.log(error);
            // console.log("here");
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function InsertIntoTable(arrs,ID) {
    // console.log("Entering");
    return new Promise(async function(resolve,reject) {
        try {
            const Alerts = ORM.model('trs_tbl_home_alerts');
            let finalArrayForTable = [];
            for(let a = 0 ; a < arrs.length;a++) {
                // console.log("entered a loop");
                let findingInTable = await FindDataInTable(arrs[a],ID);
                if(findingInTable.message) {
                    arrs[a].carrier_id = ID;
                    finalArrayForTable.push(arrs[a]);
                }    
            }
            // console.log(finalArrayForTable);
            Alerts.bulkCreate(finalArrayForTable).then(inserted => {
                // console.log("inserted");
                return resolve({success:true , message:"Inserted"});
            }).catch(erro => {
                console.log(erro);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function FindDataInTable(obj,ID) {
    return new Promise(function(resolve,reject) {
        try {
            const Alerts = ORM.model('trs_tbl_home_alerts');
            Alerts.findAndCountAll({where:{'carrier_id':ID}}).then(resp => {
                let Internalcount = 0;
                // console.log(resp.rows.length);
                for(let i = 0 ; i < resp.rows.length ; i++) {
                    // console.log("entered i loop");
                    if(obj.documentName == resp.rows[i].documentName) {
                        Internalcount++;
                    }
                }
                if(Internalcount == 0) {
                    return resolve({success:true, message:true});
                }
                else {
                    return resolve({success:true , message:false});
                }
            }).catch(errs => {
                console.log(errs);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function getFollowUpDays(filter,ID) {
    return new Promise(function(resolve,reject) {
        try {
            const Settings = ORM.model('trs_tbl_settings_for_carriers');
            let queryWhere = {};
            if(filter == 'driver') {
                queryWhere['settings_id'] = 5;
                queryWhere['carrier_id'] = ID;
            }
            if(filter == 'assets') {
                queryWhere['settings_id'] = 6;
                queryWhere['carrier_id'] = ID;
            }
            if(filter == 'irs') {
                queryWhere['settings_id'] = 8;
                queryWhere['carrier_id'] = ID;
            }
            if(filter == 'ifta') {
                queryWhere['settings_id'] = 9;
                queryWhere['carrier_id'] = ID; 
            }
            if(filter == 'irp') {
                queryWhere['settings_id'] = 7;
                queryWhere['carrier_id'] = ID;
            }
            if(filter == 'corporate') {
                queryWhere['settings_id'] = 10;
                queryWhere['carrier_id'] = ID;
            }
            return Settings.findOne({where:queryWhere}).then(data => {
                if(data)
                return resolve({success:true , result:data});
                else {
                    return resolve({success:true,results:[] , message:"No records found"});
                }
            }).catch(err => {
                console.log(err);
                // console.log("follow up catch");
                return reject({success:false , message:"Something went wrong"});
            })
        }   
        catch(err) {
            console.log(err);
            // console.log("follow up try catch");
            return reject({success:false , message:"Something went wrong"});
        }
        
    });
    
}
function getCorporateDocuments(carrierID) {
    return new Promise(async function(resolve,reject) {
        try {
            let queryWhere = {'carrier_id':carrierID};
            let assets_follow_up_days = await getFollowUpDays('corporate',carrierID);
            const Corporate = ORM.model('trs_tbl_corporate_information');
            const CorporateDocuments = ORM.model('trs_tbl_corporate_info_documents');
            return Corporate.findAndCountAll({where:queryWhere,
                include : [
                    {model:CorporateDocuments,where:{'is_deleted':0,'is_removed_from_home':0} ,on:{'$trs_tbl_corporate_information.corporate_information_id$' : {'$col':'trs_tbl_corporate_info_documents.corporate_information_id'}}}
                ]
            }).then(documents => {
                if(documents) {
                    let finalArray = [];
                    documents.rows.forEach(element => {
                        element = element.get({plain:true});
                        // console.log(element)
                        element.trs_tbl_corporate_info_documents.forEach(docData => {
                            if(docData.exp_date){
                                let findingDate = new Date(docData.exp_date);
                                let difference = 0;
                                difference = dateDiffInDays(new Date(), findingDate);
                                if(difference > 0) {
                                    if(difference < assets_follow_up_days.result.setting_value) {
                                        let new_array = {};
                                        new_array['expiringDate'] = docData.exp_date;
                                        new_array['ID'] = docData.document_id;
                                        new_array['documentName'] = docData.document_name;
                                        new_array['documentType'] = "Corporate";
                                        new_array['referene'] = docData.document_originalname;
                                        new_array['document'] = docData.document_s3_url;
                                        new_array['difference'] = difference;
                                        finalArray.push(new_array);
                                    }
                                }
                            }
                            
                        }) 
                    }) 
                    return resolve({success:true , results: finalArray, count:documents.count});
                }
                else {
                    return resolve({success:true ,results:[], message:"No Assets documents records found"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

function getDriversDocuments(carrierID) {
    return new Promise(async function(resolve,reject) {
        try {
            // console.log(carrierID,'sadsad')
            let queryWhere = {'is_deleted':0,'carrier_id':carrierID,'is_active':1};
            // queryWhere['is_removed_from_home'] = 0;
            let driver_follow_up_days = await getFollowUpDays('driver',carrierID);
            // console.log(driver_follow_up_days.result.setting_value,"dsd");
            // let driver_id = await getDriverIdForDocuments();
            const Drivers = ORM.model('trs_tbl_drivers');
            const DriverDocuments = ORM.model('trs_tbl_driver_documents');
            return Drivers.findAndCountAll({where:queryWhere,
                include :[
                    {model:DriverDocuments,where: { 'is_deleted': 0,'is_removed_from_home':0 }, on:{'$trs_tbl_drivers.driver_id$' : {'$col':'trs_tbl_driver_documents.driver_id'}}},
                ]
            }).then(documents => {
                if(documents) {
                    let finalArray = [];
                    documents.rows.forEach(element => {
                        element = element.get({plain:true});
                        // console.log(element);
                        element.trs_tbl_driver_documents.forEach(docData => {
                            // console.log(element);
                            let findingDate = new Date(docData.exp_date);
                            let difference = 0;
                            difference = dateDiffInDays(new Date(), findingDate);
                            // console.log(difference);
                            // console.log(findingDate);
                            // console.log(new Date());
                            // console.log(difference);
                            if(difference > 0) {
                                if(difference < driver_follow_up_days.result.setting_value) {
                                    let new_array = {};
                                    // console.log("sdsdsdsd");
                                    // console.log(element.exp_date);
                                    new_array['expiringDate'] = docData.exp_date;
                                    new_array['ID'] = docData.document_id;
                                    new_array['documentName'] = docData.document_name;
                                    new_array['documentType'] = "Driver";
                                    // new_array['referene'] = docData.document_originalname;
                                    new_array['referene'] = element.driver_first_name + " " + element.driver_last_name + " (Driver Name)";
                                    new_array['document'] = docData.document_s3_url;
                                    new_array['difference'] = difference;
                                    finalArray.push(new_array);
                                }
                            }
                            // console.log(follow_up_days.result.value - difference);  
                        })
                    }) 
                    return resolve({success:true , results: finalArray, count:documents.count});
                }
                else {
                    return resolve({success:true ,results:[], message:"No driver documents records found"});
                }
            }).catch(err => {
                console.log(err);
                // console.log("Driver docx catch");
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            // console.log("driver docx try catch");
            return reject({success:false , message:"Something went wrong"});
        }
    });
    
}

function getAssetsDocuments(carrierID) {
    return new Promise(async function(resolve,reject) {
        try {
            let queryWhere = {'is_deleted':0,'carrier_id':carrierID,'is_active':1};
            let assets_follow_up_days = await getFollowUpDays('assets',carrierID);
            const Assets = ORM.model('trs_tbl_assets');
            const AssetsDocuments = ORM.model('trs_tbl_asset_documents');
            return Assets.findAndCountAll({where:queryWhere,
                include : [
                    {model:AssetsDocuments,where:{'is_deleted':0,'is_removed_from_home':0} ,on:{'$trs_tbl_assets.asset_id$' : {'$col':'trs_tbl_asset_documents.asset_id'}}}
                ]
            }).then(documents => {
                if(documents) {
                    let finalArray = [];
                    documents.rows.forEach(element => {
                        element = element.get({plain:true});
                        element.trs_tbl_asset_documents.forEach(docData => {
                            let findingDate = new Date(docData.exp_date);
                            let difference = 0;
                            difference = dateDiffInDays(new Date(), findingDate);
                            if(difference > 0) {
                                if(difference < assets_follow_up_days.result.setting_value) {
                                    let new_array = {};
                                    new_array['expiringDate'] = docData.exp_date;
                                    new_array['ID'] = docData.asset_document_id;
                                    new_array['documentName'] = docData.document_name;
                                    new_array['documentType'] = "Assets";
                                    // new_array['referene'] = docData.document_originalname;
                                    new_array['referene'] = element.asset_number_id + " (Asset ID)";
                                    new_array['document'] = docData.document_s3_url;
                                    new_array['difference'] = difference;
                                    finalArray.push(new_array);
                                }
                            }
                        }) 
                    }) 
                    return resolve({success:true , results: finalArray, count:documents.count});
                }
                else {
                    return resolve({success:true ,results:[], message:"No Assets documents records found"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
    
}

function getIRSDocuments(carrierID) {
    return new Promise(async function(resolve,reject) {
        try {
            let queryWhere = {'is_deleted':0,'carrier_id':carrierID};
            const IRS = ORM.model('trs_tbl_irs');
            const IRSDocuments = ORM.model('trs_tbl_irs_year_documents');
            let IRS_follow_up_days = await getFollowUpDays('irs',carrierID);
            return IRS.findAndCountAll({where:queryWhere,
                include : [
                    {model:IRSDocuments,where:{'is_deleted':0,'is_removed_from_home':0} ,on:{'$trs_tbl_irs.irs_id$' : {'$col':'trs_tbl_irs_year_documents.irs_id'}}}
                ]
            }).then(documents => {
                if(documents) {
                    let finalArray = [];
                    documents.rows.forEach(element => {
                        element = element.get({plain:true});
                        // console.log(element);
                        let findingDate = new Date(element.end_date);
                        let difference = 0;
                        difference = dateDiffInDays(new Date(), findingDate);
                        // console.log(findingDate);
                        // console.log(new Date());
                        // console.log("firset");
                        // console.log(difference,"dsd");
                        if(difference > 0) {
                            if(difference < IRS_follow_up_days.result.setting_value) {
                                element.trs_tbl_irs_year_documents.forEach(docuFromTable => {
                                    let new_array = {};
                                    // console.log(element.exp_date);
                                    new_array['expiringDate'] = element.end_date;
                                    new_array['documentName'] = docuFromTable.document_name;
                                    new_array['ID'] = docuFromTable.document_id;
                                    new_array['documentType'] = "IRS";
                                    new_array['referene'] = docuFromTable.document_originalname;
                                    new_array['document'] = docuFromTable.document_path;
                                    new_array['difference'] = difference;
                                    finalArray.push(new_array);
                                })
                                
                            }
                        }
                        // console.log(follow_up_days.result.value - difference);  
                    }) 
                    return resolve({success:true , results: finalArray , count:documents.count});
                }
                else {
                    return resolve({success:true , results:[] , message:"No IRS documents records found"});
                }
            }).catch(err => {
                console.log(err);
                // console.log("IRS docx");
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            // console.log("irs docx try catch");
            return reject({success: false , message: "Something went wrong"});
        }
    })
    
}

function getIFTADocuments(carrierID) {
    return new Promise(async function(resolve,reject) {
        try {
            let queryWhere = {'document_exist':1,'carrier_id':carrierID,'is_removed_from_home':0};
            const IFTA = ORM.model('trs_tbl_ifta_year');
            // const IRSDocuments = ORM.model('trs_tbl_irs_year_documents');
            let IFTA_follow_up_days = await getFollowUpDays('ifta',carrierID);
            return IFTA.findAndCountAll({where:queryWhere}).then(documents => {
                if(documents) {
                    let finalArray = [];
                    documents.rows.forEach(element => {
                        element = element.get({plain:true});
                        // console.log(element);
                        let yearToBeDone = new Date().getFullYear();
                        // console.log(element.year_name);
                        let dates = new Date(element.year_name,11,32);
                        // console.log(dates);
                        // dates.setFullYear(yearToBeDone);
                        // dates.setMonth(11);
                        // dates.setDate(31);
                        // console.log(dates);
                        // let findingDate = new Date(element.end_date);
                        let difference = 0;
                        difference = dateDiffInDays(new Date(), dates);
                        // console.log(findingDate);
                        // console.log(new Date());
                        // console.log("firset");
                        // console.log(difference,"dsd");
                        if(difference > 0) {
                            if(difference < IFTA_follow_up_days.result.setting_value) {
                                let new_array = {};
                                // console.log(element.exp_date);
                                new_array['expiringDate'] = dates;
                                new_array['documentName'] = element.year_document_name;
                                new_array['documentType'] = "IFTA";
                                new_array['referene'] = "-";
                                new_array['ID'] = element.ifta_year_id;
                                new_array['document'] = element.year_document_path;
                                new_array['difference'] = difference;
                                finalArray.push(new_array);
                            }
                        }
                        // console.log(follow_up_days.result.value - difference);  
                    }) 
                    return resolve({success:true , results: finalArray , count:documents.count});
                }
                else {
                    return resolve({success:true , results:[] , message:"No IFTA documents records found"});
                }
            }).catch(err => {
                console.log(err);
                // console.log("ifta docx catch");
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            // console.log("ifta try catch");
            return reject({success: false , message: "Something went wrong"});
        }
    })
}

function getIRPDocuments(carrierID) {
    return new Promise(async function(resolve,reject) {
        try {
            let queryWhere = {'is_deleted':0,'carrier_id':carrierID};
            const IRP = ORM.model('trs_tbl_irp_fleet_year');
            const IRPDocuments = ORM.model('trs_tbl_irp_fleet_documents');
            // const IRSDocuments = ORM.model('trs_tbl_irs_year_documents');
            let IRP_follow_up_days = await getFollowUpDays('irp',carrierID);
            return IRP.findAndCountAll({where:queryWhere,
                include:[
                    {model:IRPDocuments ,where: { 'is_deleted': 0,'is_removed_from_home':0 }, required:false,on:{'$trs_tbl_irp_fleet_year.year_id$' : {'$col':'trs_tbl_irp_fleet_documents.year_id'}}}
                ]
            }).then(documents => {
                if(documents) {
                    let finalArray = [];
                    documents.rows.forEach(element => {
                        element = element.get({plain:true});
                        // console.log(element);
                        // let yearToBeDone = new Date().getFullYear();
                        // console.log(element.year_name);
                        let dates = new Date(element.inactive_date);
                        // console.log(dates);
                        // dates.setFullYear(yearToBeDone);
                        // dates.setMonth(11);
                        // dates.setDate(31);
                        // console.log(dates);
                        // let findingDate = new Date(element.end_date);
                        let difference = 0;
                        difference = dateDiffInDays(new Date(), dates);
                        // console.log(findingDate);
                        // console.log(new Date());
                        // console.log("firset");
                        // console.log(difference,"dsd");
                        if(difference > 0) {
                            if(difference < IRP_follow_up_days.result.setting_value) {
                                element.trs_tbl_irp_fleet_documents.forEach(weGot => {
                                    let new_array = {};
                                    // console.log(element.exp_date);
                                    new_array['expiringDate'] = dates;
                                    new_array['documentName'] = weGot.document_name;
                                    new_array['documentType'] = "IRP";
                                    new_array['referene'] = weGot.document_originalname;
                                    new_array['ID'] = weGot.document_id;
                                    new_array['document'] = weGot.document_path;
                                    new_array['difference'] = difference;
                                    finalArray.push(new_array);
                                })
                            }
                        }
                        // console.log(follow_up_days.result.value - difference);  
                    }) 
                    return resolve({success:true , results: finalArray , count:documents.count});
                }
                else {
                    return resolve({success:true , results:[] , message:"No IRP documents records found"});
                }
            }).catch(err => {
                console.log(err);
                // console.log("irp docx catch");
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            // console.log("irp docx try catch");
            return reject({success: false , message: "Something went wrong"});
        }
    })
}

function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

exports.updateAlertStatus = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.document_id) {
                return reject({success:false , message:"Invalid params"});
            }
            if(data.origin == "IRS") {
                const IRS = ORM.model('trs_tbl_irs_year_documents');
                let queryWhere = {'document_id':data.document_id};
                return IRS.findOne({where:queryWhere}).then(roles => {
                    if(roles) {
                        delete data.document_id;
                        delete data.origin;
                        for(let key in data) {
                            roles[key] = data[key];
                        }
                        return roles.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                            return resolve({success:true});
                        }).catch(error => {
                            console.log(error);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    }
                    else {
                        return reject({success:false , message:"Alert not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
            if(data.origin == "IFTA") {
                const IFTA = ORM.model('trs_tbl_ifta_year');
                let queryWhere = {'ifta_year_id':data.document_id};
                return IFTA.findOne({where:queryWhere}).then(roles => {
                    if(roles) {
                        delete data.document_id;
                        delete data.origin;
                        for(let key in data) {
                            roles[key] = data[key];
                        }
                        return roles.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                            return resolve({success:true});
                        }).catch(error => {
                            console.log(error);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    }
                    else {
                        return reject({success:false , message:"Alert not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
            if(data.origin == "Driver") {
                const Driver = ORM.model('trs_tbl_driver_documents');
                let queryWhere = {'document_id':data.document_id};
                return Driver.findOne({where:queryWhere}).then(roles => {
                    if(roles) {
                        delete data.document_id;
                        delete data.origin;
                        for(let key in data) {
                            roles[key] = data[key];
                        }
                        return roles.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                            return resolve({success:true});
                        }).catch(error => {
                            console.log(error);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    }
                    else {
                        return reject({success:false , message:"Alert not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
            if(data.origin == "Assets") {
                const Assets = ORM.model('trs_tbl_driver_documents');
                let queryWhere = {'asset_document_id':data.document_id};
                return Assets.findOne({where:queryWhere}).then(roles => {
                    if(roles) {
                        delete data.document_id;
                        delete data.origin;
                        for(let key in data) {
                            roles[key] = data[key];
                        }
                        return roles.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                            return resolve({success:true});
                        }).catch(error => {
                            console.log(error);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    }
                    else {
                        return reject({success:false , message:"Alert not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
            if(data.origin == "IRP") {
                const IRP = ORM.model('trs_tbl_irp_fleet_documents');
                let queryWhere = {'document_id':data.document_id};
                return IRP.findOne({where:queryWhere}).then(roles => {
                    if(roles) {
                        delete data.document_id;
                        delete data.origin;
                        for(let key in data) {
                            roles[key] = data[key];
                        }
                        return roles.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                            return resolve({success:true});
                        }).catch(error => {
                            console.log(error);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    }
                    else {
                        return reject({success:false , message:"Alert not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
            if(data.origin == "Corporate") {
                const Corp = ORM.model('trs_tbl_corporate_info_documents');
                let queryWhere = {'document_id':data.document_id};
                return Corp.findOne({where:queryWhere}).then(roles => {
                    if(roles) {
                        delete data.document_id;
                        delete data.origin;
                        for(let key in data) {
                            roles[key] = data[key];
                        }
                        return roles.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                            return resolve({success:true});
                        }).catch(error => {
                            console.log(error);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    }
                    else {
                        return reject({success:false , message:"Alert not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}