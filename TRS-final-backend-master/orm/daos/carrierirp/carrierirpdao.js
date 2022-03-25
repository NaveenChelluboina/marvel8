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

exports.addIrpWeightGrop = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            if (!data.fleet_id || !data.carrier_id)
            return reject({ success: false, message: 'Invalid params' });
            const irp = ORM.model('trs_tbl_irp');
            const irpweight = ORM.model('trs_tbl_irp_weight_groups');
            if(data.fleet_id) {
                let queryWhere = {"fleet_id":data.fleet_id , "carrier_id":data.carrier_id};
                return irp.findOne({where:queryWhere}).then(irpdata => {
                    if(irpdata){
                        let finalItems = [];
                        for(let i = 0 ; i < data.weight_group.length ; i++) {
                            var item = {};
                            item = {"irp_id":irpdata.irp_id , "max_weight_group": data.weight_group[i].weight,"number_of_combined_axels": data.weight_group[i].axles,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                            finalItems.push(item);
                        }
                        irpweight.bulkCreate(finalItems,{"validate":true , "userId":functions.decrypt(req.session.userId) }).then(pResponse => {
                            if(pResponse) {
                                return resolve({success:true});
                            }
                            else {
                                return reject({success:false , message:"Something went wrong"});
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    } else {
                        ORM.getObj().transaction().then(function(t) {
                            return irp.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(irp => {
                                if(irp) {
                                    let finalItems = [];
                                    for(let i = 0 ; i < data.weight_group.length ; i++) {
                                        var item = {};
                                        item = {"irp_id":irp.irp_id , "max_weight_group": data.weight_group[i].weight,"number_of_combined_axels": data.weight_group[i].axles,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                        finalItems.push(item);
                                    }
                                    irpweight.bulkCreate(finalItems,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(pResponse => {
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
                });
            }
            else {
                return reject({ success: false, message: 'Something went wrong' });
            }
            
        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

exports.addIrpDoc = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            var fileLocationInBucket = [];
            var fileNameInBucketNew = [];
            let finalItems = [];
            var form = new formidable.IncomingForm();
            const irp = ORM.model('trs_tbl_irp');
            const irpyear = ORM.model('trs_tbl_irp_fleet_year');
            const irpDocuments = ORM.model('trs_tbl_irp_fleet_documents');
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                let infoObject = JSON.parse(fields.data);
                if(infoObject.fleet_id){
                    let queryWhere = {"fleet_id":infoObject.fleet_id};
                    return irp.findOne({where:queryWhere}).then(irpdata => {
                        if(irpdata){
                            let queryWhere2 = {"year_id":infoObject.effective_Date,"fleet_id":infoObject.fleet_id,"carrier_id":infoObject.carrier_id,};
                            return irpyear.findOne({where:queryWhere2}).then(async (irpyeardata) => {
                                if(irpyeardata.year_id){
                                    for(let i = 0; i < infoObject.docsLength;i++) {
                                        let filestream = fs.createReadStream(files['filesnew'+i].path);
                                        let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['filesnew'+i].name.split(' ').join('_')
                                        let params = {Bucket:"permishare/dev/fleet-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                                        let data = await uploadFile(params);
                                        if(data.success) 
                                        fileLocationInBucket.push(data.path);
                                        fileNameInBucketNew.push(data.name);
                                    }
                                    let queryWhere = {"year_id": infoObject.effective_Date,"document_name":infoObject.document_name,"is_deleted":0};
                                    return irpDocuments.findAll({where:queryWhere}).then(documents => {
                                        if(!documents.length) {
                                            let item = {"irp_id":irpdata.irp_id , "fleet_id": infoObject.fleet_id,"year_id": infoObject.effective_Date,"document_name":infoObject.document_name,"document_path":fileLocationInBucket[0],'document_originalname':fileNameInBucketNew[0],"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                            irpDocuments.create(item,{"validate":true , "userId":functions.decrypt(req.session.userId) }).then(pResponse => {
                                                if(pResponse) {
                                                    return resolve({success:true});
                                                }
                                                else {
                                                    return reject({success:false , message:"Something went wrong"});
                                                }
                                            }).catch(err => {
                                                console.log(err);
                                                return reject({success:false , message:"Something went wrong"});
                                            });
                                        } else {
                                            return reject({success:false , message:"Document name already exists"});
                                        }
                                    });
                                }
                            });
                        } else {
                            return reject({ success: false, message: 'Something went wrong' });
                        }
                    });
                }
                else {
                    return reject({ success: false, message: 'Something went wrong' });
                }
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.addIrpYear = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if (!data.fleet_id)
            return reject({ success: false, message: 'Invalid params' });
            const irp = ORM.model('trs_tbl_irp');
            const irpyear = ORM.model('trs_tbl_irp_fleet_year');
            if(data.fleet_id) {
                let queryWhere = {"fleet_id":data.fleet_id};
                
                return irp.findOne({where:queryWhere}).then(irpdata => {
                    if(irpdata){
                        let queryWhere1 = {"year_duration":data.year_duration,"fleet_id":data.fleet_id, "carrier_id":data.carrier_id,"is_deleted" : 0};
                        return irpyear.findAll({where:queryWhere1}).then(lookup => {
                            if(!lookup.length) {
                                let item = {"irp_id":irpdata.irp_id , "fleet_id": data.fleet_id,"inactive_date":data.inactive_date,"year_duration": data.year_duration, "carrier_id":data.carrier_id,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                irpyear.create(item,{"validate":true , "userId":functions.decrypt(req.session.userId) }).then(pResponse => {
                                    if(pResponse) {
                                        return resolve({success:true});
                                    }
                                    else {
                                        return reject({success:false , message:"Something went wrong"});
                                    }
                                }).catch(err => {
                                    console.log(err);
                                    return reject({success:false , message:"Something went wrong"});
                                });
                            } else {
                                return reject({success:false , message:"Year already exists"});
                            }
                        });
                    } else {
                        ORM.getObj().transaction().then(function(t) {
                            return irp.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(irp => {
                                if(irp) {
                                    let item = {"irp_id":irp.irp_id , "fleet_id": data.fleet_id,"year_duration": data.year_duration,"inactive_date":data.inactive_date,"carrier_id":data.carrier_id,"created_by":functions.decrypt(req.session.userId), "modified_by":functions.decrypt(req.session.userId)};
                                    irpyear.create(item,{"validate":true , "userId":functions.decrypt(req.session.userId) , "transaction":t}).then(pResponse => {
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
                });
            }
            else {
                return reject({ success: false, message: 'Something went wrong' });
            }
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
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            }
            if(data) {
                // console.log(data.key.split("/").pop());
                return resolve({success:true , "path":data.Location,"name":data.Key.substr(data.Key.lastIndexOf('/')+1)});
            }
        });
    });
}

exports.getIrpYearDropDown = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            if ("fleet_id" in data) {
                queryWhere['fleet_id'] =  data.fleet_id; 
            }
            queryWhere['is_deleted'] = 0;
            const fleets = ORM.model('trs_tbl_irp_fleet_year');
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

// exports.getIrp = async function(req) {
//     return new Promise(function(resolve, reject) {
//         try {
//             const irp = ORM.model('trs_tbl_irp');
//             const irpyear = ORM.model('trs_tbl_irp_fleet_year');
//             const irpDocuments = ORM.model('trs_tbl_irp_fleet_documents');
//             const irpweight = ORM.model('trs_tbl_irp_weight_groups');
//             const assetsFleet = ORM.model('trs_tbl_fleets');
//             return irp.findAndCountAll({
//                 include:[
//                     {model:assetsFleet , on:{'$trs_tbl_irp.fleet_id$' : {'$col':'trs_tbl_fleets.fleet_id'}}},
//                     {model:irpyear ,required:false, on:{'$trs_tbl_irp.irp_id$' : {'$col':'trs_tbl_irp_fleet_years.irp_id'}}},
//                     {model:irpDocuments , required:false,on:{'$trs_tbl_irp.irp_id$' : {'$col':'trs_tbl_irp_fleet_documents.irp_id'}}},
//                     {model:irpweight , required:false,on:{'$trs_tbl_irp.irp_id$' : {'$col':'trs_tbl_irp_weight_groups.irp_id'}}},
//                 ] 
//              }).then(data => {
//                 return resolve({ "success": true, "results": data.rows, "count": data.count });
//             }).catch(err => {
//                 console.log(err);
//                 return reject({ success: false, message: 'Something went wrong' });
//             });
//         } catch (err) {
//             console.log(err);
//             return reject({ success: false, message: 'Something went wrong' });
//         }
//     });
// }

exports.getIrp = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message : "Invalid params"});
            }
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_irp'] = 1;
            queryWhere['is_active'] = 1;
            if ("carrier_id" in data) {
                queryWhere['carrier_id'] =  data.carrier_id; 
            }
            if ("fleet_id" in data) {
                queryWhere['fleet_id'] =  data.fleet_id; 
            }
            const irp = ORM.model('trs_tbl_irp');
            const irpyear = ORM.model('trs_tbl_irp_fleet_year');
            const irpDocuments = ORM.model('trs_tbl_irp_fleet_documents');
            const irpweight = ORM.model('trs_tbl_irp_weight_groups');
            const assetsFleet = ORM.model('trs_tbl_fleets');
            
            return assetsFleet.findAndCountAll({where:queryWhere,
                include:[
                    {model:irp , where: { 'is_deleted': 0 }, on:{'$trs_tbl_fleets.fleet_id$' : {'$col':'trs_tbl_irp.fleet_id'}},required:false,
                    include:[
                        {model:irpyear ,required:false, where: { 'is_deleted': 0 }, on:{'$trs_tbl_irp.irp_id$' : {'$col':'trs_tbl_irp.trs_tbl_irp_fleet_years.irp_id'}},
                        include:[
                            {model:irpDocuments ,where: { 'is_deleted': 0 }, required:false,on:{'$trs_tbl_irp.trs_tbl_irp_fleet_years.year_id$' : {'$col':'trs_tbl_irp.trs_tbl_irp_fleet_years.trs_tbl_irp_fleet_documents.year_id'}}}
                        ]
                    },
                    {model:irpweight , where: { 'is_deleted': 0 }, required:false,on:{'$trs_tbl_irp.irp_id$' : {'$col':'trs_tbl_irp.trs_tbl_irp_weight_groups.irp_id'}}}
                ]
            }
        ] 
    }).then(data => {
        let finalArray = [];
        if(data.rows.length) {
            data.rows.forEach(element => {
                element = element.get({plain:true});
                if(element.trs_tbl_irp) {
                    let arrayList = element.trs_tbl_irp.trs_tbl_irp_fleet_years;
                    arrayList.sort(function(a, b) {
                        var titleA = b.year_duration.split(' ')[1], titleB = a.year_duration.split(' ')[1];
                        if (titleA < titleB) return -1; 
                        if (titleA > titleB) return 1;
                        return 0;
                    });
                    element.trs_tbl_irp.trs_tbl_irp_fleet_years = arrayList;
                    finalArray.push(element);
                }
                else {
                    finalArray.push(element);
                }
            })
        }
        return resolve({ "success": true, "results": finalArray, "count": finalArray.length });
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

exports.deleteRecord = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            const Ideas = ORM.model('trs_tbl_irp_weight_groups');
            const irpyear = ORM.model('trs_tbl_irp_fleet_year');
            const irpDocuments = ORM.model('trs_tbl_irp_fleet_documents');
            
            if(data.year_id){
                queryWhere['year_id'] = data.year_id;
                return irpyear.findOne({ where: queryWhere }).then(idea => {
                    if (idea) {
                        for (let key in data) {
                            idea[key] = data[key];
                        }
                        return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                            return resolve({ "success": true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    } else {
                        return reject({ success: false, message: "year not found" });
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: 'Something went wrong' });
                });
            } else if (data.document_id){
                queryWhere['document_id'] = data.document_id;
                return irpDocuments.findOne({ where: queryWhere }).then(idea => {
                    if (idea) {
                        for (let key in data) {
                            idea[key] = data[key];
                        }
                        return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                            return resolve({ "success": true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    } else {
                        return reject({ success: false, message: "Category not found" });
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: 'Something went wrong' });
                });
            }
            else {
                queryWhere['weight_group_id'] = data.weight_group_id;
                return Ideas.findOne({ where: queryWhere }).then(idea => {
                    if (idea) {
                        for (let key in data) {
                            idea[key] = data[key];
                        }
                        return idea.save({ "validate": true, "userId": functions.decrypt(req.session.userId) }).then(ideas => {
                            return resolve({ "success": true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    } else {
                        return reject({ success: false, message: "weight group not found" });
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
