
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
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.addIftaYear = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            const iftayear = ORM.model('trs_tbl_ifta_year');
            
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                let infoObject = JSON.parse(fields.data);
                let queryWhere = {"year_name":infoObject.year_name,"carrier_id":infoObject.carrier_id,"is_deleted":0};
                return iftayear.findAll({where:queryWhere}).then(async (year) => {
                    if(!year.length) {
                        if(infoObject.docsLength){
                            for(let i = 0; i < infoObject.docsLength;i++) {
                                let filestream = fs.createReadStream(files['filesnew'+i].path);
                                let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew'+i].name.split(' ').join('_')
                                let params = {Bucket:"permishare/dev/ifta-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                                let data = await uploadFile(params);
                                if(data.success)  
                                fileLocationInBucket.push(data.path);
                                fileNameInBucket.push(data.name);
                                infoObject['year_document_path'] = fileLocationInBucket[0];
                                infoObject['year_document_name'] = fileNameInBucket[0];
                            }
                        }
                        return iftayear.create(infoObject,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(data => {
                            if(data) {
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
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.updateIftaYearDoc = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucket = [];
            const iftayear = ORM.model('trs_tbl_ifta_year');
            
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                let infoObject = JSON.parse(fields.data);
                let queryWhere = {"ifta_year_id":infoObject.ifta_year_id};
                return iftayear.findOne({where:queryWhere}).then(async (year) => {
                    if(!year.length) {
                        let filestream = fs.createReadStream(files['fileKey'].path);
                        let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['fileKey'].name.split(' ').join('_')
                        let params = {Bucket:"permishare/dev/ifta-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                        let data = await uploadFile(params);
                        if(data.success) {
                            fileLocationInBucket.push(data.path);
                            fileNameInBucket.push(data.name);
                        }
                        
                        infoObject['year_document_path'] = fileLocationInBucket[0];
                        infoObject['year_document_name'] = fileNameInBucket[0];
                        infoObject['document_exist'] = 1;
                        delete year.ifta_year_id;
                        for (let key in infoObject) {
                            year[key] = infoObject[key];
                        } 
                        return year.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                            return resolve({ "success": true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    } else {
                        return reject({success:false , message:"Year does not exists"});
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

exports.updateIftaYear = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const iftayear = ORM.model('trs_tbl_ifta_year');
            let queryWhere = {"ifta_year_id":data.ifta_year_id};
            if(!data.ifta_year_id) {
                return reject({success:false , message:"Invalid params"});
            }
            iftayear.findOne({ where: queryWhere }).then(campaign => {
                if (campaign) {
                    delete campaign.ifta_year_id;
                    for (let key in data) {
                        campaign[key] = data[key];
                    } 
                    return campaign.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                        return resolve({ "success": true });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                } else {
                    return reject({ "success": false, "message": "Year not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ "success": false, "message": "Something went wrong" });
            })
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.deleteiftayeardoc = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const iftayear = ORM.model('trs_tbl_ifta_year');
            let queryWhere = {"ifta_year_id":data.ifta_year_id};
            
            if(!data.ifta_year_id) {
                return reject({success:false , message:"Invalid params"});
            }
            data['year_document_path'] = null;
            data['year_document_name'] = null;
            data['document_exist'] = 0;
            if(data.is_deleted == true){
                data['is_deleted'] = 1;
            }
            iftayear.findOne({ where: queryWhere }).then(campaign => {
                if (campaign) {
                    delete campaign.ifta_year_id;
                    for (let key in data) {
                        campaign[key] = data[key];
                    } 
                    return campaign.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                        return resolve({ "success": true });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                } else {
                    return reject({ "success": false, "message": "Year not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ "success": false, "message": "Something went wrong" });
            })
            
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.addIftaAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.ifta_year_id) {
                return reject({success:false , message : "Invalid params"});
            }
            let queryWhere = {"decal_first":data.decal_first , "decal_second":data.decal_second,"carrier_id":data.carrier_id,"is_deleted":0};
            const assets = ORM.model('trs_tbl_ifta_assets');
            return assets.findOne({where:queryWhere}).then(asset => {
                if(!asset) {
                    return assets.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(data => {
                        if(data) {
                            return resolve({success:true});
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({success:false , message:"Something went wrong"});
                    });
                } else {
                    return reject({success:false , message:"Decal# is already existed"});
                }
            });
        }
        catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

exports.addbulkIftaAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            for(let i in data){
                data[i]['created_by'] = functions.decrypt(req.session.userId);
                data[i]['modified_by'] = functions.decrypt(req.session.userId);
            }
            const assets = ORM.model('trs_tbl_ifta_assets');
            assets.bulkCreate(data, { "validate":true , "userId":functions.decrypt(req.session.userId)}).then(updateres => {
                return resolve({"success":true});
            }).catch(err => { 
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        }
        catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

exports.getIftaAssets = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            // console.log(data.carrier_id);
            if(!data.per_page || !("page" in data)) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            const ifteAssets = ORM.model('trs_tbl_ifta_assets');
            const assets = ORM.model('trs_tbl_assets');
            const assetsFleet = ORM.model('trs_tbl_fleets');
            let queryWhere = { 'is_deleted': 0 };
            if ('ifta_year_id' in data) {
                queryWhere['ifta_year_id'] = data.ifta_year_id;
            }
            if ('fleet_id' in data) {
                queryWhere['fleet_id'] = data.fleet_id;
            }
            if ('asset_id' in data) {
                queryWhere['asset_id'] = data.asset_id;
            }
            return ifteAssets.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit, where: queryWhere,
                include:[
                    {model:assets,on:{'$trs_tbl_ifta_assets.asset_id$' : {'$col':'trs_tbl_asset.asset_id'}}},
                    {model:assetsFleet, on:{'$trs_tbl_ifta_assets.fleet_id$' : {'$col':'trs_tbl_fleet.fleet_id'}}},
                ]
            }).then(data => {
                if(data.rows.length) {
                    data.rows.sort(function(a, b) {
                        var titleA = a.trs_tbl_fleet.fleet_name, titleB = b.trs_tbl_fleet.fleet_name;
                        if (titleA < titleB) return -1; 
                        if (titleA > titleB) return 1;
                        return 0;
                    });
                }
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

exports.getAllIftaAssets = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Carrier ID is missing"});
            }
            const ifteAssets = ORM.model('trs_tbl_ifta_assets');
            const assets = ORM.model('trs_tbl_assets');
            const assetsFleet = ORM.model('trs_tbl_fleets');
            let queryWhere = { 'is_deleted': 0 };
            
            return ifteAssets.findAndCountAll({where: queryWhere,
                include:[
                    {model:assets,on:{'$trs_tbl_ifta_assets.asset_id$' : {'$col':'trs_tbl_asset.asset_id'}}},
                    {model:assetsFleet, on:{'$trs_tbl_ifta_assets.fleet_id$' : {'$col':'trs_tbl_fleet.fleet_id'}}},
                ]
            }).then(data => {
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

exports.updateIftaAssets = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.ifta_asset_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const iftaassets = ORM.model('trs_tbl_ifta_assets');
            let queryWhere = { "ifta_asset_id": { $in: [data.ifta_asset_id] } };
            let queryWhere1 = {"decal_first":data.decal_first , "decal_second":data.decal_second,"is_deleted":0,"carrier_id":data.carrier_id,"ifta_asset_id": {$notIn:[data.ifta_asset_id]}};
            iftaassets.findOne({ where: queryWhere }).then(campaign => {
                if (campaign) {
                    return iftaassets.findAll({where:queryWhere1}).then(loadedLookup => {
                        if(!loadedLookup.length) {
                            delete campaign.ifta_asset_id;
                            for (let key in data) {
                                campaign[key] = data[key];
                            }
                            return campaign.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(updateres => {
                                return resolve({ "success": true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        }
                        else {
                            return reject({success:false , message:"Decal# is already existed"});
                        }
                    }).catch(error => {
                        console.log(error);
                        return reject({success:false , message:"Something went wrong"});
                    });
                    
                } else {
                    return reject({ "success": false, "message": "Asset# not found" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ "success": false, "message": "Something went wrong" });
            })
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.getIftaYear = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            const fleets = ORM.model('trs_tbl_ifta_year');
            let queryWhere = {'carrier_id':data.carrier_id}
            queryWhere['is_deleted'] = 0;
            // console.log(queryWhere)
            return fleets.findAndCountAll({where:queryWhere}).then(data => {
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
                return resolve({success:true , "path":data.Location,"name":data.Key.substr(data.Key.lastIndexOf('/')+1)});
            }
        });
    });
}