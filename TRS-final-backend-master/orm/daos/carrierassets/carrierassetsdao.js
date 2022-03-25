const ORM = require('../../associations/table_associations');
var config = require('../../../config');
const functions = require('../../../lib/functions');
var _ = require('underscore');
var param = process.argv[2];
var originurl = config[param];
var AWS = require('aws-sdk');
var fs = require('fs');
var originServerUrl = config[param+'Serv'];
const winston = require('winston');
var formidable = require('formidable');
var DriverFCM = require('fcm-node');
var serverKey = 'AAAA379Jl14:APA91bGJHa1M9YwjSOMVjV-zjWYOzAuL4rANimLZUdJXXUTS_tb7d1NckMQUPNuDUKUI4Xi6Grs6vJRDyTSlfrm2e76H6UqRq7XtsUKtEvv9dFQcvJ5Ew1jOayf8cBp4UisHSL_XVEe6'; //put your server key here
var driverFCM = new DriverFCM(serverKey);
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.checkExpiryDateOfAsset = function(req, res) {
    return new Promise((resolve, reject) => {
        try {
            var myDate = new Date();
            let itemArray = [];
            const Assets = ORM.model('trs_tbl_assets');
            let queryWhere = { "is_deleted": 0,"is_active":1, "inactive_date": { $lt: myDate } };
            let requiredFields = ["asset_id","fleet_id","asset_number_id","asset_type_id","year","asset_make_id","model","vin_number","country_id","registered_weight","units","number_of_axels","start_date","inactive_date","comments","is_active","is_deleted","created_by","created_date","modified_by","modified_date","created_by","modified_by"];
            return Assets.findAll({attributes: requiredFields, where: queryWhere }).then(asset => {
                for(i = 0; i < asset.length; i++){
                    if (asset[i].inactive_date){
                        let finalObj = {"asset_id":asset[i].asset_id,"fleet_id":asset[i].fleet_id,"asset_number_id":asset[i].asset_number_id,"asset_type_id":asset[i].asset_type_id,"year":asset[i].year,"asset_make_id":asset[i].asset_make_id,"model":asset[i].model,"vin_number":asset[i].vin_number,"country_id":asset[i].country_id,"registered_weight":asset[i].registered_weight,"units":asset[i].units,"number_of_axels":asset[i].number_of_axels,"start_date":asset[i].start_date,"inactive_date":asset[i].inactive_date,"comments":asset[i].comments,"is_active":0,"is_deleted":asset[i].is_deleted,"created_by":asset[i].created_by,"created_date":asset[i].created_date,"modified_by":asset[i].modified_by,"modified_date":asset[i].modified_date,"created_by":asset[i].created_by,"modified_by":asset[i].modified_by};
                        itemArray.push(finalObj);
                    }
                }
                if(itemArray.length != 0){
                    Assets.bulkCreate(itemArray,{updateOnDuplicate:["is_active"]}).then(campaign => {
                        itemArray = [];
                        return resolve({success: true, message: 'updated successfully'});
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

exports.addAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let queryWhere = {};
            const assets = ORM.model('trs_tbl_assets');
            const assetsDocs = ORM.model('trs_tbl_asset_documents');
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                let infoObject = JSON.parse(fields.data);
                let MessageSendDriver = infoObject.notification_message;
                delete infoObject.notification_message;
                let docsObject = JSON.parse(fields.documentsData);
                queryWhere['asset_number_id'] = infoObject.asset_number_id;
                queryWhere['is_deleted'] = 0;
                queryWhere['carrier_id'] = infoObject.carrier_id;
                // console.log(queryWhere);
                return assets.findOne({where:queryWhere}).then(async (asset) => {
                    if(!asset){
                        for(let i = 0; i < infoObject.docsLength;i++) {
                            let filestream = fs.createReadStream(files['filesnew'+i].path);
                            let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew'+i].name.split(' ').join('_')
                            let params = {Bucket:"permishare/dev/asset-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                            let data = await uploadFile(params);
                            if(data.success) 
                            fileLocationInBucket.push(data.path);
                            fileNameInBucket.push(data.name);
                        }
                        ORM.getObj().transaction().then(function(t) {
                            return assets.create(infoObject,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(async caseRegistered => {
                                if(caseRegistered) {
                                    let finalItems = [];
                                    let NotificationCount = 0;
                                    for(let i = 0 ; i < infoObject.docsLength ; i++) {
                                        var item = {};
                                        if(docsObject[i].appAccess)
                                        NotificationCount++;
                                        item = {"asset_id":caseRegistered.asset_id , "document_name": docsObject[i].docRef,"document_originalname": fileNameInBucket[i],"document_type": docsObject[i].docType,"document_s3_url": fileLocationInBucket[i],"issue_date": docsObject[i].issueDate,"exp_date": docsObject[i].expiryDate,"app_access":docsObject[i].appAccess,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                        finalItems.push(item);
                                    }
                                    // if(NotificationCount) {
                                    //     let sendDriverNotification = await notifyDrivers(infoObject.carrier_id,MessageSendDriver);
                                    //     if(!sendDriverNotification.success)
                                    //     return reject({success:false , message:"Something went wrong"});
                                    // }
                                    assetsDocs.bulkCreate(finalItems,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(pResponse => {
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
                    } else {
                        return reject({success:false , message:"Asset ID already exists"});
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


exports.addNewAssetsDocument = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let finalItems = [];
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                let infoObject = JSON.parse(fields.assetsInfo);
                let docsObject = JSON.parse(fields.documentsData);
                if(!infoObject.asset_id) {
                    return reject({success:false , message:"Invalid params"});
                }
                for(let i = 0; i < infoObject.docsLength;i++) {
                    let filestream = fs.createReadStream(files['filesnew'+i].path);
                    let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew'+i].name.split(' ').join('_')
                    let params = {Bucket:"permishare/dev/asset-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                    let data = await uploadFile(params);
                    if(data.success) 
                    fileLocationInBucket.push(data.path);
                    fileNameInBucket.push(data.name);
                }
                const assets = ORM.model('trs_tbl_assets');
                const assetsDocs = ORM.model('trs_tbl_asset_documents');
                let queryWhere = { 'is_deleted': 0 };
                queryWhere = { "asset_id": infoObject.asset_id};
                if(infoObject.asset_id){
                    let NotificationCount = 0;
                    for(let i = 0 ; i < infoObject.docsLength ; i++) {
                        var item = {};
                        if(docsObject[i].appAccess)
                        NotificationCount++;
                        item = {"asset_id":infoObject.asset_id ,"app_access":docsObject[i].appAccess, "document_name": docsObject[i].docRef,"document_originalname": fileNameInBucket[i],"document_type": docsObject[i].docType,"document_s3_url": fileLocationInBucket[i],"issue_date": docsObject[i].issueDate,"exp_date": docsObject[i].expiryDate,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                        // item = {"asset_id":infoObject.asset_id , "document_name": fileLocationInBucket[i],"document_originalname": fileNameInBucket[i],"document_type": docsObject[i].docType,"ref_number": docsObject[i].docRef,"issue_date": docsObject[i].issueDate,"exp_date": docsObject[i].expiryDate,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                        finalItems.push(item);
                    }  
                    if(NotificationCount) {
                        let sendDriverNotification = await notifyDrivers(infoObject.carrier_id,infoObject.notification_message,infoObject.asset_id);
                        if(!sendDriverNotification.success)
                        return reject({success:false , message:"Something went wrong"});
                    }
                }
                delete infoObject.notification_message;
                delete infoObject.carrier_id;
                assetsDocs.bulkCreate(finalItems,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(updateRes => {
                    assets.findOne({ where: queryWhere }).then(campaign => {
                        if (campaign) {
                            delete infoObject.asset_id;
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
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.getAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.per_page || !("page" in data) || !data.carrier_id) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            let queryWhere = {};
            let orderBy = [];
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id
            if ("asset_number_id" in data) {
                queryWhere["asset_number_id"] = { $like: '%' + data.asset_number_id + '%' };
            }
            if ("fleet_id" in data) {
                queryWhere['fleet_id'] = { $in: data.fleet_id };
            }
            if ("asset_type_id" in data) {
                queryWhere['asset_type_id'] = { $in: data.asset_type_id };
            }
            if ("year" in data) {
                queryWhere['year'] = { $in: data.year };
            }
            if ("vin_number" in data) {
                queryWhere["vin_number"] = { $like: '%' + data.vin_number + '%' };
            }
            if ("number_of_axels" in data) {
                queryWhere["number_of_axels"] = { $like: '%' + data.number_of_axels + '%' };
            }
            if ("registered_weight" in data) {
                queryWhere["registered_weight"] = { $like: '%' + data.registered_weight + '%' };
            }
            if ("is_active" in data) {
                queryWhere['is_active'] =  data.is_active; 
            }
            if("a-z" in data) {
                orderBy = [["asset_number_id",  "asc"]];
            }
            if("z-a" in data) {
                orderBy = [["asset_number_id",  "desc"]];
            }
            const assets = ORM.model('trs_tbl_assets');
            const assetsDocs = ORM.model('trs_tbl_asset_documents');
            const assetsFleet = ORM.model('trs_tbl_fleets');
            const assetsMake = ORM.model('trs_tbl_asset_make');
            const assetsType = ORM.model('trs_tbl_asset_type');
            const Drivers = ORM.model('trs_tbl_drivers');
            const States = ORM.model('trs_tbl_states');
            return assets.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere,order:orderBy
                ,include:[
                    {model:assetsDocs ,where: { 'is_deleted': 0 },required:false, on:{'$trs_tbl_assets.asset_id$' : {'$col':'trs_tbl_asset_documents.asset_id'}}},
                    {model:assetsFleet ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.fleet_id$' : {'$col':'trs_tbl_fleet.fleet_id'}}},
                    {model:assetsType ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_type_id$' : {'$col':'trs_tbl_asset_type.asset_type_id'}}},
                    {model:assetsMake ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_make_id$' : {'$col':'trs_tbl_asset_make.asset_make_id'}}},
                    {model:Drivers ,required:false, where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_id$' : {'$col':'trs_tbl_drivers.current_active_asset_id'}}},
                    {model:States , on:{'$trs_tbl_assets.state_id$' : {'$col':'trs_tbl_state.state_id'}}}
                ]
            }).then(roles => {
                if(roles.rows.length) {
                    roles.rows.sort(function(a, b) {
                        var titleA = a.asset_number_id, titleB = b.asset_number_id;
                        if (titleA < titleB) return -1; 
                        if (titleA > titleB) return 1;
                        return 0;
                    });
                }
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

exports.updateAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            let finalItems = [];
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                let infoObject = JSON.parse(fields.data);
                let docsObject = JSON.parse(fields.documentsData);
                if(!infoObject.asset_id) {
                    return reject({success:false , message:"Invalid params"});
                }
                for(let i = 0; i < infoObject.docsLength;i++) {
                    let filestream = fs.createReadStream(files['filesnew'+i].path);
                    let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew'+i].name.split(' ').join('_')
                    let params = {Bucket:"permishare/dev/asset-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                    let data = await uploadFile(params);
                    if(data.success) 
                    fileLocationInBucket.push(data.path);
                    fileNameInBucket.push(data.name);
                }
                const assets = ORM.model('trs_tbl_assets');
                const assetsDocs = ORM.model('trs_tbl_asset_documents');
                let queryWhere = { 'is_deleted': 0 };
                queryWhere = { "asset_id": infoObject.asset_id};
                if(infoObject.asset_id){
                    let NotificationCount = 0;
                    for(let i = 0 ; i < infoObject.docsLength ; i++) {
                        var item = {};
                        if(docsObject[i].appAccess)
                        NotificationCount++;
                        item = {"asset_id":infoObject.asset_id ,"app_access":docsObject[i].appAccess, "document_name": docsObject[i].docRef,"document_originalname": fileNameInBucket[i],"document_type": docsObject[i].docType,"document_s3_url": fileLocationInBucket[i],"issue_date": docsObject[i].issueDate,"exp_date": docsObject[i].expiryDate,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                        // item = {"asset_id":infoObject.asset_id, "document_name": fileLocationInBucket[i],"document_originalname": fileNameInBucket[i],"document_type": docsObject[i].docType,"ref_number": docsObject[i].docRef,"issue_date": docsObject[i].issueDate,"exp_date": docsObject[i].expiryDate,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                        finalItems.push(item);
                    }
                    if(NotificationCount) {
                        let sendDriverNotification = await notifyDrivers(infoObject.carrier_id,infoObject.notification_message,infoObject.asset_id);
                        if(!sendDriverNotification.success)
                        return reject({success:false , message:"Something went wrong"});
                    }
                }
                delete infoObject.notification_message;
                assetsDocs.bulkCreate(finalItems,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(updateRes => {
                    assets.findOne({ where: queryWhere }).then(campaign => {
                        if (campaign) {
                            delete infoObject.asset_id;
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
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.updateAssetsComments = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.asset_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Drivers = ORM.model('trs_tbl_assets');
            
            let queryWhere = {'asset_id':data.asset_id};
            return Drivers.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.asset_id;
                    for(let key in data) {
                        // console.log(data[key]);
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
                    return reject({success:false , message:"Asset not found"});
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

exports.updateDocuments = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            if(!data.asset_document_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Documents = ORM.model('trs_tbl_asset_documents');
            let queryWhere = { "asset_document_id": { $in: [data.asset_document_id] } };
            return Documents.findOne({ where: queryWhere }).then(async idea => {
                if (idea) {
                    if(data.app_access) {
                        let dendAssetNotifications = await notifyDrivers(data.carrier_id,data.notification_message,idea.asset_id);
                        delete data.notification_message;
                        delete data.carrier_id;
                        if(dendAssetNotifications.success) {
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
                            return reject({success:false , message:"Something went wrong"});
                        }
                    }
                    else {
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

async function uploadFile(params) {
    return new Promise(async function(resolve,reject) {
        let s3bucket = new AWS.S3({
            accessKeyId : "AKIAJHQH3V5CC4VGJEKQ",
            secretAccessKey : "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"
            //,Bucket : "clinical-scheduling/dev/lop"
        });
        
        await s3bucket.upload(params,function(err,data) {
            if(err) {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            }
            if(data) {
                //  console.log(data.key.split("/").pop());
                return resolve({success:true , "path":data.Location,"name":data.Key.substr(data.Key.lastIndexOf('/')+1)});
            }
        });
    });
}

exports.getAllAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id;
            if ("asset_number_id" in data) {
                queryWhere["asset_number_id"] = { $like: '%' + data.asset_number_id + '%' };
            }
            if ("fleet_id" in data) {
                queryWhere['fleet_id'] = { $in: data.fleet_id };
            }
            if ("asset_type_id" in data) {
                queryWhere['asset_type_id'] = { $in: data.asset_type_id };
            }
            if ("year" in data) {
                queryWhere['year'] = { $in: data.year };
            }
            if ("vin_number" in data) {
                queryWhere["vin_number"] = { $like: '%' + data.vin_number + '%' };
            }
            if ("number_of_axels" in data) {
                queryWhere["number_of_axels"] = { $like: '%' + data.number_of_axels + '%' };
            }
            if ("registered_weight" in data) {
                queryWhere["registered_weight"] = { $like: '%' + data.registered_weight + '%' };
            }
            if ("is_active" in data) {
                queryWhere['is_active'] = data.is_active;
            }
            const assets = ORM.model('trs_tbl_assets');
            const assetsDocs = ORM.model('trs_tbl_asset_documents');
            const assetsFleet = ORM.model('trs_tbl_fleets');
            const assetsMake = ORM.model('trs_tbl_asset_make');
            const assetsType = ORM.model('trs_tbl_asset_type');
            const States = ORM.model('trs_tbl_states');
            return assets.findAndCountAll({where:queryWhere
                ,include:[
                    {model:assetsDocs ,required:false,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_id$' : {'$col':'trs_tbl_asset_documents.asset_id'}}},
                    {model:assetsFleet ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.fleet_id$' : {'$col':'trs_tbl_fleet.fleet_id'}}},
                    {model:assetsType ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_type_id$' : {'$col':'trs_tbl_asset_type.asset_type_id'}}},
                    {model:assetsMake ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_make_id$' : {'$col':'trs_tbl_asset_make.asset_make_id'}}},
                    {model:States , on:{'$trs_tbl_assets.state_id$' : {'$col':'trs_tbl_state.state_id'}}}
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

exports.getAllAssetTypes = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const Assets = ORM.model('trs_tbl_asset_type');
            return Assets.findAndCountAll({where:{'is_deleted':0}}).then(states => {
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


exports.getAllAssetMakes = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const Assets = ORM.model('trs_tbl_asset_make');
            return Assets.findAndCountAll({where:{'is_deleted':0}}).then(states => {
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

exports.getAllFleets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const Assets = ORM.model('trs_tbl_fleets');
            return Assets.findAndCountAll({where:{'is_deleted':0 , 'carrier_id':data.carrier_id}}).then(states => {
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

exports.addBulkAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            // if(!data.email_address || !data.driver_first_name || !data.driver_last_name || !data.cell_phone || !data.dl_number || !data.dl_class || !data.address1 || !data.city || !data.country_id || !data.state_id || !data.start_date)
            // return reject({ success: false, message: 'Invalid params' });
            const Assets = ORM.model('trs_tbl_assets');
            Assets.bulkCreate(data, { "validate":true , "userId":functions.decrypt(req.session.userId)}).then(updateres => {
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

exports.getAllAssetDropDown = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id;
            queryWhere['is_active'] = 1;
            if (data.isIfta == true) {
                queryWhere = {'fleet_id':data.fleet_id};
            }
            const Assets = ORM.model('trs_tbl_assets');
            return Assets.findAndCountAll({where:queryWhere}).then(states => {
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

exports.updateGridColumns = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                // console.log("hee");
                return reject({success:false , message:"Invalid params"});
            }
            const AssetGrids = ORM.model('trs_tbl_asset_grid_columns');
            let queryWhere = {'carrier_id':data.carrier_id};
            return AssetGrids.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.asset_grid_column_id;
                    for(let key in data) {
                        // console.log(data[key]);
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
                    return reject({success:false , message:"Assets not found"});
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

exports.getGridColumns = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {'carrier_id':data.carrier_id};
            const AssetGrids = ORM.model('trs_tbl_asset_grid_columns');
            return AssetGrids.findAndCountAll({where:queryWhere}).then(states => {
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

exports.deleteAsset = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.asset_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_assets');
            let queryWhere = {'asset_id':data.asset_id};
            return Roles.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.role_id;
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
                    return reject({success:false , message:"Asset not found"});
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


exports.getMaxSize = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_carriers');
            const packages = ORM.model('trs_tbl_packages');
            let queryWhere = {'carrier_id':data.carrier_id};
            return Roles.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    return packages.findOne({where:{'package_id':roles.package_id}}).then(lookups => {
                        return resolve({success:true , results:lookups});
                    }).catch(error => {
                        console.log(error);
                        return reject({success:false , message:"Something went wrong"});
                    });
                }
                else {
                    return reject({success:false , message:"Carrier not found"});
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

exports.getAssetsAndDocxForMobile = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const assets = ORM.model('trs_tbl_assets');
            const assetsDocs = ORM.model('trs_tbl_asset_documents');
            const assetsFleet = ORM.model('trs_tbl_fleets');
            const assetsMake = ORM.model('trs_tbl_asset_make');
            const assetsType = ORM.model('trs_tbl_asset_type');
            let queryWhere = {};
            if('AssetId' in data){
                queryWhere['asset_id'] = data.AssetId
            }
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id;
            queryWhere['is_active'] = 1;
            return assets.findAndCountAll({where:queryWhere
                ,include:[
                    {model:assetsDocs ,where: { 'is_deleted': 0 , 'app_access':1 },required:false, on:{'$trs_tbl_assets.asset_id$' : {'$col':'trs_tbl_asset_documents.asset_id'}}},
                    {model:assetsFleet ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.fleet_id$' : {'$col':'trs_tbl_fleet.fleet_id'}}},
                    {model:assetsType ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_type_id$' : {'$col':'trs_tbl_asset_type.asset_type_id'}}},
                    {model:assetsMake ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_assets.asset_make_id$' : {'$col':'trs_tbl_asset_make.asset_make_id'}}}
                ],
                order: [
                    [{model: assetsDocs},"document_name", "asc"],
                  ],
            }).then(roles => {
                let finalArray = [];
                years = [{'year_id':1,'year_name':'2022'},
                {'year_id':2,'year_name':'2021'},
                {'year_id':3,'year_name':'2020'},
                {'year_id':4,'year_name':'2019'},
                {'year_id':5,'year_name':'2018'},
                {'year_id':6,'year_name':'2017'},
                {'year_id':7,'year_name':'2016'},
                {'year_id':8,'year_name':'2015'},
                {'year_id':9,'year_name':'2014'},
                {'year_id':10,'year_name':'2013'},
                {'year_id':11,'year_name':'2012'},
                {'year_id':12,'year_name':'2011'},
                {'year_id':13,'year_name':'2010'},
                {'year_id':14,'year_name':'2009'},
                {'year_id':15,'year_name':'2008'},
                {'year_id':16,'year_name':'2007'},
                {'year_id':17,'year_name':'2006'},
                {'year_id':18,'year_name':'2005'},
                {'year_id':19,'year_name':'2004'},
                {'year_id':20,'year_name':'2003'},
                {'year_id':21,'year_name':'2002'},
                {'year_id':22,'year_name':'2001'},
                {'year_id':23,'year_name':'2000'},
                {'year_id':24,'year_name':'1999'},
                {'year_id':25,'year_name':'1998'},
                {'year_id':26,'year_name':'1997'},
                {'year_id':27,'year_name':'1996'},
                {'year_id':28,'year_name':'1995'},
                {'year_id':29,'year_name':'1994'},
                {'year_id':30,'year_name':'1993'},
                {'year_id':31,'year_name':'1992'},
                {'year_id':32,'year_name':'1991'},
                {'year_id':33,'year_name':'1990'},
                {'year_id':34,'year_name':'1989'},
                {'year_id':35,'year_name':'1988'},
                {'year_id':36,'year_name':'1987'},
                {'year_id':37,'year_name':'1986'},
                {'year_id':38,'year_name':'1985'},
                {'year_id':39,'year_name':'1984'},
                {'year_id':40,'year_name':'1983'},
                {'year_id':41,'year_name':'1982'},
                {'year_id':42,'year_name':'1981'},
                {'year_id':43,'year_name':'1980'}, 
            ]
            roles.rows.forEach(element => {
                element = element.get({plain:true});
                let obj = {};
                obj['AssetId'] = element.asset_id;
                obj['AssetDisplayId'] = element.asset_number_id;
                obj['type'] = element.trs_tbl_asset_type.asset_name;
                obj['year'] = years.find(function(yearId) {
                    if(yearId.year_id == element.year) {
                        return true;
                    }
                });
                obj['make'] = element.trs_tbl_asset_make.asset_make_name;
                obj['model'] = element.model;
                obj['vin'] = element.vin_number;
                obj['registered_weight'] = (element.registered_weight) + ' ' + (element.units==1?'Kgs':'lbs');
                obj['axels'] = element.number_of_axels;
                obj['plate #'] = element.plate;
                obj['documents'] = element.trs_tbl_asset_documents;
                finalArray.push(obj);
            })
            return resolve({success:true , results:finalArray});
        }).catch(err => {
            console.log(err);
            return reject({success:false,message:"Something went wrong"});
        });
    }
    catch(error) {
        console.log(error);
        return reject({success:false , message:"Something went wrong"});
    }
})
}

async function notifyDrivers(carrierId,NotificationMessage,assetID) {
    return new Promise(async function(resolve,reject) {
        try {
            if (!carrierId) {
                return { success: false, message: "Invalid parameters" };
            }
            let addRecordInNotificationTable = await addNoitificationRecord(carrierId,NotificationMessage);
            if(addRecordInNotificationTable.success) {
                const Drivers = ORM.model('trs_tbl_drivers');
                var FireBaseIds = [];
                let driverDoc = await Drivers.findAll({ where: { "carrier_id": carrierId,'is_deleted':0,'is_active':1,'current_active_asset_id':assetID } });
                if (driverDoc.length) {
                    for (let i = 0; i < driverDoc.length; i++) {
                        driverDoc[i] = driverDoc[i].get({ plain: true });
                        if (driverDoc[i].driver_firebase_id && driverDoc[i].driver_firebase_id != '')
                        FireBaseIds.push(driverDoc[i].driver_firebase_id);
                    }
                    
                    // let message = "You have new corporate documents to download."
                    if(FireBaseIds.length) {
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
                        driverFCM.send(notificationObj, function(err, response) {
                            if (err) {
                                console.log("Something went wrong!", err);
                                return reject({success:false , message:"Something went wrong" });
                            } else {
                                console.log("Successfully sent with response: ", response);
                                return resolve({ success: true, message: "Successful", result: response });
                            }
                        });
                    }
                    else {
                        return resolve({success:true})
                    }
                } else {
                    return resolve({ success: true, message: "No drivers" });
                }
            }
            else {
                return reject({success:false , message:"Something went wrong"});
            }
        } catch (error) {
            console.log(error);
            return reject({ "success": false, "message": "Something went wrong" });
        }
    })
    
}

function addNoitificationRecord(id,message) {
    return new Promise(function(resolve,reject) {
        try {
            let finalObj = {};
            finalObj['app_notification_message'] = message;
            finalObj['carrier_id'] = id;
            let date = new Date();
            let date2 = new Date(date);
            finalObj['created_date'] = date2.setMinutes(date.getMinutes() - 240);
            const Notifications = ORM.model('trs_tbl_app_notifications');
            return Notifications.create(finalObj).then(recordAdded => {
                return resolve({success:true});
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}