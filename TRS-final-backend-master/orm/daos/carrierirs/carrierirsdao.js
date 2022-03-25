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

exports.addYearInIRS = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.year || !data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const IRS = ORM.model('trs_tbl_irs');
            let queryWhere = {'year':data.year,'is_deleted':0,"carrier_id":data.carrier_id};
            let findBeforeAddingYearInIrs = await getTheResultOfSearch(data.year,data.carrier_id);
            if(findBeforeAddingYearInIrs.success) {
                return IRS.findAll({where:queryWhere}).then(irs => {
                    if(!irs.length) {
                        return IRS.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(asset => {
                            if(asset) {
                                return resolve({success:true});
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({success:false , message:"Something went wrong"});
                        });
                        
                    } else {
                        return reject({success:false , message:"Year already exists"});
                    }
                });
            }
            else {
                return reject({success:false , message:findBeforeAddingYearInIrs.message});
            }
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

function getTheResultOfSearch(yearToAddInIRS,cId) {
    return new Promise(function(resolve,reject) {
        try {
            // console.log(yearToAddInIRS);
            let addedYear = yearToAddInIRS.split(' ')[1];
            const IRS = ORM.model('trs_tbl_irs');
            let queryWhere = {'is_deleted':0,"carrier_id":cId};
            let found = false;
            return IRS.findAll({where:queryWhere}).then(irs => {
                if(!irs.length) {
                    return resolve({success:true , message:"Go ahead"});
                } else {
                    irs.forEach(element => {
                        element = element.get({plain:true});
                        // console.log(element);
                        if(element.year.split(' ')[1] == addedYear)
                        found = true;
                    });
                    if(found == true) {
                        return resolve({success:false , message:"Year already exists"});
                    }
                    else {
                        return resolve({success:true , message:"Go ahead"});
                    }
                }
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    })
    
}

exports.getAllIRS = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const IRS = ORM.model('trs_tbl_irs');
            const IRSDocs = ORM.model('trs_tbl_irs_year_documents');
            const AssetWithDocuments = ORM.model('trs_tbl_irs_assets_for_document');
            const Assets = ORM.model('trs_tbl_assets');
            return IRS.findAndCountAll({where:{'is_deleted':0,"carrier_id":data.carrier_id},
            include:[
                {model:IRSDocs,required:false,where:{'is_deleted':0} ,on:{'$trs_tbl_irs.irs_id$' : {'$col':'trs_tbl_irs_year_documents.irs_id'}},
                include:[
                    {model:AssetWithDocuments,
                        include:[{model:Assets}]
                    }
                ]
            }
        ]
    }).then(async (states) => {
        if(states.rows.length) {
            let yearsArrayToSort = [];
            let finalArrayToFrontend = [];
            states.rows.forEach(element => {
                element = element.get({plain:true});
                // console.log(element.year);
                yearsArrayToSort.push(element.year.split(' ')[1])
            });
            // console.log(yearsArrayToSort);
            let sortedArrayOfYears = await sorting(yearsArrayToSort);
            // console.log(sortedArrayOfYears.results);
            for(let i = 0; i < sortedArrayOfYears.results.length; i++) {
                states.rows.forEach(yearsNowTosend => {
                    if(sortedArrayOfYears.results[i] == yearsNowTosend.year.split(' ')[1])
                    finalArrayToFrontend.push(yearsNowTosend);
                });
            }
            // console.log(finalArrayToFrontend);
            return resolve({success:true , results:finalArrayToFrontend , count:states.count});
        }
        else {
            return resolve({success:true, results:[]})
        }
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

function sorting(years) {
    return new Promise(function(resolve,reject) {
        try {
            let yearNew = years.sort(function(a, b){return b-a});
            return resolve({success:true , results : yearNew});
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    })
    
}

exports.addIrsDocumentForYear = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucketNew = [];
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                const Documents = ORM.model('trs_tbl_irs_year_documents');
                const AssetDocs = ORM.model('trs_tbl_irs_assets_for_document');
                let infoObject = JSON.parse(fields.documentsData);
                let docsArrayObject = JSON.parse(fields.assetsDocumentsdata);
                let docuWhere = {'irs_id':infoObject.irs_id ,'is_deleted':0, 'document_name':infoObject.document_name};
                // logger.info(docsArrayObject);
                // console.log(docsArrayObject);
                return Documents.findAll({where:docuWhere}).then(async (recording) => {
                    if(!recording.length) {
                        let filestream = fs.createReadStream(files['filess'].path);
                        let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filess'].name.split(' ').join('_')
                        let params = {Bucket:"permishare/dev/irs-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                        let data = await uploadFile(params);
                        if(data.success) 
                        fileLocationInBucket.push(data.path);
                        fileNameInBucketNew.push(data.name);
                        infoObject.document_path = fileLocationInBucket[0];
                        infoObject.document_originalname = fileNameInBucketNew[0];
                        // const CorporateInformation = ORM.model('trs_tbl_corporate_information');
                        // const CorporateInformationDocuments = ORM.model('trs_tbl_corporate_info_documents');
                        ORM.getObj().transaction().then(function(t) {
                            return Documents.create(infoObject,{"validate":true , "userId":functions.decrypt(req.session.userId) ,  "transaction" : t}).then(caseRegistered => {
                                if(caseRegistered) {
                                    // return resolve({success:true});
                                    let finalItems = [];
                                    for(let i = 0 ; i < docsArrayObject.TotalLength ; i++) {
                                        var item = {};
                                        item = {"document_id":caseRegistered.document_id , "asset_id": docsArrayObject.items[i]['asset_id'],"status": docsArrayObject.items[i]['status'],"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                        // if(i == 0)
                                        // item = {"case_id":caseRegistered.case_id , "user_id": userObject.attorney_id, user_type:1,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                        // if(i == 1)
                                        // item = {"case_id":caseRegistered.case_id , "user_id": userObject.referring_physician_id, user_type:2,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                        finalItems.push(item);
                                    }
                                    AssetDocs.bulkCreate(finalItems,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(pResponse => {
                                        if(pResponse) {
                                            t.commit();
                                            return resolve({success:true});
                                        }
                                        else {
                                            return reject({success:false , message:"Something went wrong"});
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                        return reject({success:false , message:"Something went wrong"});
                                    });
                                }
                                else {
                                    return reject({success:false , message:"Something went wrong"});
                                }
                            }).catch(error => {
                                console.log(error);
                                return reject({success:false , message:"Something went wrong"});
                            });
                        });
                    }
                    else {
                        return reject({success:false , message:"Document with this name already exists"});
                    }
                });
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

async function uploadFile(params) {
    return new Promise(async function(resolve,reject) {
        let s3bucket = new AWS.S3({
            accessKeyId : "AKIAJHQH3V5CC4VGJEKQ",
            secretAccessKey : "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"
            //,Bucket : "clinical-scheduling/dev/lop"
        });
        
        await s3bucket.upload(params,function(err,data) {
            if(err) {
                //console.log("here")
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            }
            if(data) {
                //console.log("here");
                
                return resolve({success:true , "path":data.Location,"name":data.Key.substr(data.Key.lastIndexOf('/')+1)});
            }
        });
    });
}

exports.getAssetsWithDocuments = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['document_id'] = data.document_id;
            // const IRS = ORM.model('trs_tbl_irs');
            // const IRSDocs = ORM.model('trs_tbl_irs_year_documents');
            const AssetWithDocuments = ORM.model('trs_tbl_irs_assets_for_document');
            const Assets = ORM.model('trs_tbl_assets');
            return AssetWithDocuments.findAndCountAll({
                where:queryWhere,include:[
                    {model:Assets , on :{'$trs_tbl_irs_assets_for_document.asset_id$' : {'$col':'trs_tbl_asset.asset_id'}}}
                ]
            }).then(states => {
                return resolve({success:true , results:states.rows , count:states.count});
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

exports.updateAssetDocumentStatus = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.items)
            return reject({ success: false, message: 'Invalid params' });
            
            data.id = null;
            const AssetWithDocuments = ORM.model('trs_tbl_irs_assets_for_document');
            AssetWithDocuments.bulkCreate(data.items, { fields:["asset_document_id","status"] ,updateOnDuplicate: ["status"]}).then(updateres => {
                return resolve({"success":true});
            }).catch(err => { 
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        }
        catch(error) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.getDocumentsForAssetsPage = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['document_id'] = data.document_id;
            // const IRS = ORM.model('trs_tbl_irs');
            // const IRSDocs = ORM.model('trs_tbl_irs_year_documents');
            const AssetWithDocuments = ORM.model('trs_tbl_irs_year_documents');
            // const Assets = ORM.model('trs_tbl_assets');
            return AssetWithDocuments.findAndCountAll({
                where:queryWhere
            }).then(states => {
                return resolve({success:true , results:states.rows , count:states.count});
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

exports.updateDocumentInIrs = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.document_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_irs_year_documents');
            let queryWhere = {'document_id':data.document_id};
            return Roles.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.document_id;
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
                    return reject({success:false , message:"Document not found"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.deleteYearInIrs = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.irs_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_irs');
            let queryWhere = {'irs_id':data.irs_id};
            return Roles.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.irs_id;
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
                    return reject({success:false , message:"IRS Year not found"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.updateCalendarInIrs = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.irs_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_irs');
            let queryWhere = {'irs_id':data.irs_id};
            let lookupWhere = {'year':data.year,"is_deleted":0,"irs_id": {$notIn:[data.irs_id]}};
            return Roles.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    return Roles.findAll({where:lookupWhere}).then(loadedLookup => {
                        if(!loadedLookup.length) {
                            delete data.irs_id;
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
                            return reject({success:false , message:"Year with this details already exists"});
                        }
                    })
                }
                else {
                    return reject({success:false , message:"IRS Year not found"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}