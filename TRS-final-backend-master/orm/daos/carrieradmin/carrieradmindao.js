const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const commonemitter = require('../../../lib/custom-events').commonEmitter;
const ORM = require('../../associations/table_associations');
const functions = require('../../../lib/functions');
var formidable = require('formidable');
const async = require('async');
const sgMail = require('@sendgrid/mail');
// const sgMail = require('@sendgrid/mail');
var AWS = require('aws-sdk');
var config = require('../../../config');
var Sequelize = require("sequelize");
var _ = require('underscore');
var param = process.argv[2];
var originurl = config[param];
// sgMail.setApiKey(config['sendgridKey']);
sgMail.setApiKey(config['sendgridKey']);
var originServerUrl = config[param+'Serv'];
const winston = require('winston');
var pdf = require("pdf-creator-node");
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
var ejs = require('ejs');
var fs = require('fs');
var DriverFCM = require('fcm-node');
var serverKey = 'AIzaSyADiQ8u_BGYCmTR125LcWH4w9U4oRlEFYg'; //put your server key here
var driverFCM = new DriverFCM(serverKey);
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.addNewUser =  function(req) {
    return new Promise(async function(resolve, reject) {
        try {
            let data = req.body;
            if(!data.user_name || !data.user_email || !data.phone || !data.role_id || !data.carrier_id)
            return reject({ auth: false, message: 'Invalid params' });
            const Users = ORM.model('trs_tbl_users');
            let requiredFields = ["user_id","is_deleted"];
            let already_exists = await checkIfAlreadyExists(data, Users, requiredFields);
            if(already_exists.success) {
                var accessToken = functions.randomValueBase64(20);
                let hash = bcrypt.hashSync(accessToken, 10);
                data.password_reset_token = hash;
                data.password = hash;
                Users.create(data,{"validate":true, "userId":functions.decrypt(req.session.userId)}).then(async (usrres) => {
                    var token = functions.encrypt(accessToken);
                    var uId = functions.encrypt(usrres.user_id.toString());
                    var url = originurl + '/#/userverification?uid=' + uId + '&activationToken=' + token;
                    var email = data.user_email;
                    let sending_email = await getSendingEmail(data.carrier_id);
                    let email_res = await sendActivationEmail(url, email, data.user_name,sending_email.value);
                    let company_copy = await sendActivationEmail(url, 'support@permishare.com', data.user_name,sending_email.value);
                    if(email_res.success && company_copy.success) {
                        return resolve(email_res);
                    } else {
                        return reject(email_res);
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({"success":false, "message": 'Something went wrong'});
                });
            } else {
                return reject(already_exists);
            }
        } catch(err) {
            console.log(err);
            logger.info("in catch")
            return reject({"success":false, "message": 'Something went wrong'});
        }
    });
}

function getSendingEmail(carrierId) {
    return new Promise(function(resolve,reject) {
        const settings = ORM.model('trs_tbl_settings_for_carriers');
        let queryWhere = {'settings_id':2, 'carrier_id':carrierId};
        // console.log(queryWhere);
        return settings.findOne({where:queryWhere}).then(data => {
            return resolve({success:true , value :data.setting_value});
        }).catch(err => {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        })
    })
}


function checkIfAlreadyExists(data, model, requiredFields) {
    try {
        return model.findAll({attributes:requiredFields, where:{"user_email":data.user_email,"is_deleted":0}}).then(userdata => {
            if(userdata.length === 0) {
                return {"success":true};
            } else {
                return {"success":false, "message":"User with same email id already exists"};
            }
        }).catch(err => {
            return {"success":false, "message":"Something went wrong"};
        });
    } catch(err) {
        console.log(err);
        return {"success":false};
    }
}

function sendActivationEmail(url, email, name, sendingEmail) {
    return new Promise(function(resolve, reject) {
        const msg = {
            to: email,
            from: sendingEmail,
            subject: 'Account Activation - PermiShare',
            html: '<p>Hello '+ functions.capitalizeString(name) +',</p></br> <p>Welcome to PermiShare, please click the below link to activate your account.</p> </br><b>' + url + '</b></br></br><p>Thanks</p></br><b>PermiShare Support Team</b>' // html body
        };
        sgMail.send(msg).then(() => {
            return resolve({"success":true, "message": "Account activation link is sent to your email. please check"});
        }).catch(error => {
            return reject({"success":false, "message":"Failed to send verification link", "error": error.toString()});
        });
    });
}

exports.getRoles = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.per_page || !("page" in data) || !data.carrier_id) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['carrier_id'] = data.carrier_id
            if("role_name" in data) {
                queryWhere['role_name'] = {$like :'%'+data.role_name+'%'};
            }
            if("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            let arrayForNotBet = [12, 18];
            if(data.forAdminAdded)
            arrayForNotBet = [12,19];
            console.log(arrayForNotBet);
            const Roles = ORM.model('trs_tbl_roles');
            const Permissions = ORM.model('trs_tbl_permissions');
            var finalResults = [];
            return Roles.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere
                ,include:[
                    {model:Permissions ,where:{'right_master_id':{$notBetween: arrayForNotBet}}, attributes:['permission_type'] , on:{'$trs_tbl_roles.role_id$' : {'$col':'trs_tbl_permissions.role_id'}}}
                ]
            }).then(async (roles) => {
                let totalCount = 0;
                let count  = await Roles.findAndCountAll({where:queryWhere}).then(counts => {
                    totalCount = counts.count;
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
                if(roles.rows.length != 0) {
                    for (let i in roles.rows){
                        element = roles.rows[i].get({plain:true});
                        let flag = await getflags(element,data.carrier_id);
                        if(flag.success) {
                            element['is_block'] = 1;
                        }
                        else {
                            element['is_block'] = 0;
                        }
                        element['role_id'] = functions.encrypt(element.role_id.toString());
                        let temp = element.trs_tbl_permissions;
                        let totalPemStr = temp.map(e => e.permission_type).join("");
                        element['permissions'] = totalPemStr.split('1').length-1 +'/'+ totalPemStr.split('').length;
                        delete element.trs_tbl_permissions;
                        finalResults.push(element);
                    }
                    // roles.rows.forEach(async element => {
                    //     // element = element.get({plain:true});
                    //     // let flag = await getflags(element,data.carrier_id);
                    //     // if(flag.success) {
                    //     //     element['is_block'] = 1;
                    //     // }
                    //     // else {
                    //     //     element['is_block'] = 0;
                    //     // }
                    //     let temp = element.trs_tbl_permissions;
                    //     let totalPemStr = temp.map(e => e.permission_type).join("");
                    //     element['permissions'] = totalPemStr.split('1').length-1 +'/'+ totalPemStr.split('').length;
                    //     delete element.trs_tbl_permissions;
                    //     finalResults.push(element);
                    // });
                    return resolve({success:true , results:finalResults , count:totalCount});
                }
                else {
                    // console.log("here");
                    return resolve({success:true , finalResults:[] , count:roles.count});
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

function getflags(url, email) {
    return new Promise(function(resolve, reject) {
        const users = ORM.model('trs_tbl_users');
        let queryWhere = {is_deleted:0,role_id:url.role_id,carrier_id:email}
        return users.findAndCountAll({where:queryWhere}).then(data => {
            if(data.rows.length)
            return resolve({"success":true, resultsnow:1});
            else
            return resolve({"success":false, resultsnow:0});
        }).catch(error => {
            console.log(error);
            return reject({"success":false, "message":"Something went wrong"});
        }); 
    });
}

// function (ids,id) {
//     return new Promise(function(resolve,reject) {
//         try {
//             const users = ORM.model('trs_tbl_users');
//             // console.log(ids);
//             let queryWhere = {is_deleted:0 , role_id:ids.role_id, carrier_id:id} ;
//             return users.findAndCountAll({where:queryWhere}).then(data => {
//                 if(data.rows.length) {
//                     return resolve({success:true, result:1});
//                 }
//                 else {
//                     return resolve({success:false , result:0})
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 return reject({success:false , message:"Something went wrong"});
//             })
//         }
//         catch(err) {
//             console.log(err);
//             return reject({success:false , message:"Something went wrong"});
//         }
//     })
// }

exports.getRolePermissions = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.params;
            if(!data.roleId)
            return reject({success:false , message:"Invalid params"});
            const Permissions = ORM.model('trs_tbl_permissions');
            const RightMaster = ORM.model('trs_tbl_right_master');
            let orderBy = [["right_master_id",  "asc"]];
            return Permissions.findAll({ 
                attributes:["permission_id","right_master_id","permission_type"], where :{'role_id':functions.decrypt(data.roleId)}, order:orderBy,
                include:[{model:RightMaster,where:{'is_active':1}, attributes:['right_master_name'], on:{'$trs_tbl_permissions.right_master_id$' : {'$col' : 'trs_tbl_right_master.right_master_id'}}, where :{'is_active':1, 'is_deleted': 0}, required:true}] 
            }).then(perm_res => {
                let results = [];
                perm_res.forEach(element => {
                    element = element.get({plain:true});
                    element['right_master_name'] = element.trs_tbl_right_master.right_master_name;
                    delete element.trs_tbl_right_master;
                    results.push(element);
                });
                return resolve({"success":true, "results":results});
            }).catch(err => {
                console.log(err);
                return reject({"success":false});
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.updateUserPermissions = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.items)
            return reject({ success: false, message: 'Invalid params' });
            if(!data.items.length)
            return reject({ success: false, message: 'Empty permissions set' });
            data.id = null;
            const Permissions = ORM.model('trs_tbl_permissions');
            Permissions.bulkCreate(data.items, { fields:["permission_id","permission_type"] ,updateOnDuplicate: ["permission_type"]}).then(updateres => {
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

exports.addRoles = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.role_name || !data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_roles');
            let queryWhere = {'role_name':data.role_name , 'is_deleted':0 , 'carrier_id':data.carrier_id};
            return Roles.findAll({where:queryWhere}).then(role => {
                if(!role.length) {
                    ORM.getObj().transaction().then(function(t) {
                        return Roles.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId), "transaction" : t}).then(async (role_res) => {
                            let perm_res = await allocatePermissions(role_res, t, functions.decrypt(req.session.userId));
                            if(perm_res.success) {
                                t.commit();
                                return resolve(perm_res);
                            } else {
                                return reject(perm_res);
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    })
                } else {
                    return reject({success:false , message:"Permission Level already exists"});
                }
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

function allocatePermissions(roledata, t, userId) {
    return new Promise(function(resolve, reject) {
        const Permissions = ORM.model('trs_tbl_permissions');
        const RightMaster = ORM.model('trs_tbl_right_master');
        RightMaster.findAll({attributes:["right_master_id"], where:{is_deleted: false}}).then(rights => {
            if(rights.length > 0) {
                let finalItems = [];
                for(let i=0; i< rights.length; i++) {
                    let item = { "right_master_id":rights[i].right_master_id, "role_id":roledata.role_id, "permission_type":'0000',"created_by":userId, "modified_by":userId};
                    finalItems.push(item);
                }
                Permissions.bulkCreate(finalItems,{"validate":true, "userId":userId, "transaction":t}).then(perm_res => {
                    return resolve({"success":true});
                }).catch(err => {
                    console.log(err);
                    return reject({"success":false, "message": 'Something went wrong'});
                });
            } else {
                return reject({"success":false, "message":"No permissions exists."});
            }
        }).catch(err => {
            console.log(err);
            return reject({"success":false, "message": 'Something went wrong'});
        })
    });
}

exports.updateRole = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.role_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Roles = ORM.model('trs_tbl_roles');
            let queryWhere = {'role_id':functions.decrypt(data.role_id)};
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
                    return reject({success:false , message:"Role not found"});
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

exports.getAssetTypes = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.per_page || !("page" in data)) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            if("asset_name" in data) {
                queryWhere['asset_name'] = {$like :'%'+data.asset_name+'%'};
            }
            if("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            const AssetTypes = ORM.model('trs_tbl_asset_type');
            return AssetTypes.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere}).then(assets => {
                return resolve({success : true , results : assets.rows , count : assets.count});
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

exports.getAssetTypeDropdown = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_active'] = 1;
            const AssetTypes = ORM.model('trs_tbl_asset_type');
            return AssetTypes.findAndCountAll({where:queryWhere}).then(assets => {
                return resolve({success : true , results : assets.rows , count : assets.count});
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

exports.updateAssetType = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.asset_type_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Assets = ORM.model('trs_tbl_asset_type');
            let queryWhere = {'asset_type_id':data.asset_type_id};
            return Assets.findOne({where:queryWhere}).then(assets => {
                if(assets) {
                    delete data.asset_type_id;
                    for(let key in data) {
                        assets[key] = data[key];
                    }
                    return assets.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                        return resolve({success:true});
                    }).catch(error => {
                        console.log(error);
                        return reject({success:false , message:"Something went wrong"});
                    });
                }
                else {
                    return reject({success:false , message:"Asset-Type not found"});
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

exports.addAssetType = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.asset_name || !data.asset_type) {
                return reject({success:false , message:"Invalid params"});
            }
            const Assets = ORM.model('trs_tbl_asset_type');
            let queryWhere = {'asset_name':data.asset_name , 'is_deleted':0};
            return Assets.findAll({where:queryWhere}).then(assets => {
                if(!assets.length) {
                    return Assets.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(asset => {
                        if(asset) {
                            return resolve({success:true});
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({success:false , message:"Something went wrong"});
                    });
                    
                } else {
                    return reject({success:false , message:"Asset-Type already exists"});
                }
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.getAssetMakes = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.per_page || !("page" in data)) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            if("asset_make_name" in data) {
                queryWhere['asset_make_name'] = {$like :'%'+data.asset_make_name+'%'};
            }
            if("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            const AssetMakes = ORM.model('trs_tbl_asset_make');
            return AssetMakes.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere}).then(assets => {
                return resolve({success : true , results : assets.rows , count : assets.count});
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

exports.getAssetMakesDropDown = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_active'] = 1;
            if("asset_type" in data) {
                queryWhere['asset_type'] = {$in: [data.asset_type]};
            }
            
            const AssetMakes = ORM.model('trs_tbl_asset_make');
            return AssetMakes.findAndCountAll({where:queryWhere}).then(assets => {
                return resolve({success : true , results : assets.rows , count : assets.count});
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

exports.updateAssetMake = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.asset_make_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Assets = ORM.model('trs_tbl_asset_make');
            let queryWhere = {'asset_make_id':data.asset_make_id};
            return Assets.findOne({where:queryWhere}).then(assets => {
                if(assets) {
                    delete data.asset_make_id;
                    for(let key in data) {
                        assets[key] = data[key];
                    }
                    return assets.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                        return resolve({success:true});
                    }).catch(error => {
                        console.log(error);
                        return reject({success:false , message:"Something went wrong"});
                    });
                }
                else {
                    return reject({success:false , message:"Asset-Type not found"});
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

exports.addAssetMake = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.asset_make_name || !data.asset_type) {
                return reject({success:false , message:"Invalid params"});
            }
            const Assets = ORM.model('trs_tbl_asset_make');
            let queryWhere = {'asset_make_name':data.asset_make_name , 'is_deleted':0};
            return Assets.findAll({where:queryWhere}).then(assets => {
                if(!assets.length) {
                    return Assets.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(asset => {
                        if(asset) {
                            return resolve({success:true});
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({success:false , message:"Something went wrong"});
                    });
                    
                } else {
                    return reject({success:false , message:"Asset-Make already exists"});
                }
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.getRolesDropdown = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let queryWhere = {"carrier_id":data.carrier_id};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_active'] = 1;
            
            const Roles = ORM.model('trs_tbl_roles');
            
            return Roles.findAndCountAll({where:queryWhere}).then(roles => {
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

exports.getAllUsers = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.per_page || !("page" in data)) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            var userId = functions.decrypt(req.session.userId);
            let queryWhere = {"user_id": {$notIn:[userId]},"is_deleted" : 0 , "carrier_id":data.carrier_id};
            queryWhere['is_deleted'] = 0;
            if("user_name" in data) {
                queryWhere['user_name'] = {$like :'%'+data.user_name+'%'};
            }
            if("is_active" in data) {
                queryWhere["is_active"] = data.is_active;
            }
            const Users = ORM.model('trs_tbl_users');
            const Roles = ORM.model('trs_tbl_roles');
            // const Permissions = ORM.model('trs_tbl_permissions');
            return Users.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere,attributes:["is_deleted","is_active","user_id","user_name","phone","user_email"]
            ,include:[
                {model:Roles , attributes:['role_name','role_id'] , on:{'$trs_tbl_users.role_id$' : {'$col':'trs_tbl_role.role_id'}}}
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

exports.updateUser = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.user_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Users = ORM.model('trs_tbl_users');
            let queryWhere = {'user_id':data.user_id};
            return Users.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.user_id;
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
                    return reject({success:false , message:"Role not found"});
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

exports.getSelectedStatesDropDown = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            const states = ORM.model('trs_tbl_states');
            let queryWhere = {'country_id' : { $in: ['38','231']}};
            return states.findAndCountAll({where: queryWhere}).then(settings => {
                return resolve({"success":true, "results":settings.rows, "count":settings.count});
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

exports.getSettings = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            // console.log(data);
            if(!("page" in data) || !("per_page" in data)) {
                return reject({"success":false, "message": "Pagination params missing."})
            }
            let orderBy = [["settings_id",  "asc"]];
            let start_limit = parseInt(data["page"])  * parseInt(data["per_page"]);
            const Settings = ORM.model('trs_tbl_settings');
            let queryWhere = {'carrier_id':data.carrier_id};
            const CarrierSettings = ORM.model('trs_tbl_settings_for_carriers');
            return CarrierSettings.findAndCountAll({where:queryWhere,order:orderBy, limit: parseInt(data["per_page"]), offset : start_limit,
            include : [
                {model:Settings, on:{'$trs_tbl_settings_for_carriers.settings_id$' : {'$col':'trs_tbl_setting.settings_id'}}}
            ]
        }).then(settings => {
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
            console.log(data);
            if(!data.new_value || !data.carrier_settings_id)
            return reject({ success: false, message: 'Invalid params' });
            data.id = data.carrier_settings_id;
            const CarrierSettings = ORM.model('trs_tbl_settings_for_carriers');
            let queryWhere = {"carrier_settings_id": {$in:[data.carrier_settings_id]}};
            return CarrierSettings.findOne({where:queryWhere}).then(setting => {
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

exports.SendOut = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            // const Alerts = ORM.model('trs_tbl_home_alerts');
            const settings = ORM.model('trs_tbl_settings_for_carriers');
            let countingContinues = await getCarriersCountNow();
            // console.log(countingContinues.results);
            for(let i = 0; i < countingContinues.count; i++) {
                let GetSendEmail = await getSendingEmail(countingContinues.results[i].carrier_id);
                let GetToEmail = await getToEmail(countingContinues.results[i].carrier_id);
                let GetToEmailSec = await getToEmailSec(countingContinues.results[i].carrier_id);
                // console.log(GetSendEmail, "sending email");
                // console.log(GetToEmail,"primary");
                // console.log(GetToEmailSec,"Secondary");
                // console.log(GetSendEmail,i);
                // console.log(GetToEmail,i);
                // let data = req.body;
                let finalArray = [];
                let returnFromDriverDocx = await getDriversDocuments(countingContinues.results[i].carrier_id);
                let resultOfReturnFromDriverDocx = returnFromDriverDocx.results;
                // console.log(returnFromDriverDocx);
                let firstConcat = finalArray.concat(resultOfReturnFromDriverDocx);
                // console.log(firstConcat);
                let returnFromAssetsDocx = await getAssetsDocuments(countingContinues.results[i].carrier_id);
                let resultOfReturnFromAssetsDocx = returnFromAssetsDocx.results;
                let assetContact = firstConcat.concat(resultOfReturnFromAssetsDocx);
                let returnFromIrsDocx = await getIRSDocuments(countingContinues.results[i].carrier_id);
                let resultOfReturnFromIrsDocx = returnFromIrsDocx.results;
                let secondConcat = assetContact.concat(resultOfReturnFromIrsDocx);
                let returnFromIFTADocx = await getIFTADocuments(countingContinues.results[i].carrier_id);
                let resultOfReturnFromIFTADocx = returnFromIFTADocx.results;
                let thirdConcat = secondConcat.concat(resultOfReturnFromIFTADocx);
                let returnFromIRPDocx = await getIRPDocuments(countingContinues.results[i].carrier_id);
                let resultOfReturnFromIRPDocx = returnFromIRPDocx.results;
                let fourthConcat = thirdConcat.concat(resultOfReturnFromIRPDocx);
                let returnFromCorporateDocx = await getCorporateDocuments(countingContinues.results[i].carrier_id);
                let resultOfReturnFromCorporateDocx = returnFromCorporateDocx.results;
                let fifthConcat = fourthConcat.concat(resultOfReturnFromCorporateDocx);
                if(fifthConcat.length) {
                    let StartSending = await generateHTMLToPDF(fifthConcat,GetToEmail.value,"Subscriber",GetSendEmail.value,GetToEmailSec.value);
                }
            }
        }
        catch(error) {
            console.log(error);
            // console.log("here");
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function getCarriersCountNow() {
    return new Promise(function(resolve,reject) {
        try {
            const Carriers = ORM.model('trs_tbl_carriers');
            return Carriers.findAndCountAll({where:{"carrier_id":{"$notIn":[1]},'is_active':1}}).then(data => {
                return resolve({success:true , results:data.rows , count:data.count});
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

function getSendingEmail(carrierId) {
    return new Promise(function(resolve,reject) {
        const settings = ORM.model('trs_tbl_settings_for_carriers');
        let queryWhere = {'settings_id':2, 'carrier_id':carrierId};
        // console.log(queryWhere);
        return settings.findOne({where:queryWhere}).then(data => {
            return resolve({success:true , value :data.setting_value});
        }).catch(err => {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        })
    })
}

function getToEmail(carrierId) {
    return new Promise(function(resolve,reject) {
        const settings = ORM.model('trs_tbl_settings_for_carriers');
        let queryWhere = {'settings_id':3, 'carrier_id':carrierId};
        // console.log(queryWhere);
        return settings.findOne({where:queryWhere}).then(data => {
            return resolve({success:true , value :data.setting_value});
        }).catch(err => {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        })
    })
}

function getToEmailSec(carrierId) {
    return new Promise(function(resolve,reject) {
        const settings = ORM.model('trs_tbl_settings_for_carriers');
        let queryWhere = {'settings_id':4, 'carrier_id':carrierId};
        // console.log(queryWhere);
        return settings.findOne({where:queryWhere}).then(data => {
            return resolve({success:true , value :data.setting_value});
        }).catch(err => {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        })
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
                                        new_array['documentName'] = new_array['documentName'].match(/.{1,50}/g)[0];
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
            let queryWhere = {'is_deleted':0,'carrier_id':carrierID};
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
                                    new_array['documentName'] = new_array['documentName'].match(/.{1,50}/g)[0];
                                    new_array['documentType'] = "Driver";
                                    new_array['referene'] = element.driver_first_name + " " + element.driver_last_name + " (Driver Name)";
                                    // new_array['referene'] = docData.document_originalname;
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
            let queryWhere = {'is_deleted':0,'carrier_id':carrierID};
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
                                    new_array['documentName'] = new_array['documentName'].match(/.{1,50}/g)[0];
                                    new_array['documentType'] = "Assets";
                                    new_array['referene'] = element.asset_number_id + " (Asset ID)";
                                    // new_array['referene'] = docData.document_originalname;
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
                                    new_array['documentName'] = new_array['documentName'].match(/.{1,50}/g)[0];
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
            let queryWhere = {'document_exist':1,'carrier_id':carrierID,'is_deleted':0,'is_removed_from_home':0};
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
                                new_array['expiringDate'] = element.year_name+"-12-31";
                                new_array['documentName'] = element.year_document_name;
                                new_array['documentName'] = new_array['documentName'].match(/.{1,50}/g)[0];
                                new_array['documentType'] = "IFTA";
                                new_array['referene'] = "-";
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
                                    new_array['expiringDate'] = element.inactive_date;
                                    new_array['documentName'] = weGot.document_name;
                                    new_array['documentName'] = new_array['documentName'].match(/.{1,50}/g)[0];
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

function generateHTMLToPDF(finalObj, email, name,fromMail,secEmail) {
    try {
        console.log(finalObj);
        finalObj.sort(function(a, b) {
            return a.difference - b.difference;
        });
        // console.log(email);
        // console.log(name);
        var html = fs.readFileSync('views/pdf.html', 'utf8');
        var options = { 
            "directory": "/views",   
            "format": "A3",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
            "orientation": "landscape", // portrait or landscape 
            "base": "file://"+process.cwd()+'/',
            "header": {
                "height": "40px"
            },
            "footer": {
                "height": "40px"
            },
        };
        var document = {
            html: html,
            data: {
                users: finalObj
            },
            path: 'views/'+Date.now()+'.pdf'
        };
        // var fname='views/'+Date.now()+'.pdf';
        pdf.create(document, options).then(async res => {
            let email_res = await emailDailySalesReport(res.filename, email, fromMail, name, secEmail,document.path);
            if(email_res.success)
            return {"success":true};
        }).catch(error => {
            console.log(error);
        });
        // if (err) return console.log(err);
        // console.log(res1.filename);
        //response.render('response', { filename : res.filename }) 
        //response.save();
        
        //await deleteCompletedOrderList(courseId);
        
        //res.download(fname);
        
        // return {"success":true};
        
    } catch(err) {
        console.log(err);
        return { success: false, message: 'Something went wrong' };
    }
}

function base64_encode(file){
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

function emailDailySalesReport(file, email, fromMail, name, secEmail, pathoffile) {
    try {
        let data_base64 = base64_encode(file);
        const msg = {
            to: email,
            personalizations: [{
                "to": [{
                    "email": email
                }, {
                    "email": secEmail
                }],
                "subject": 'Daily Alerts Report from PermiShare'
            }],
            from: "alerts@permishare.com",
            // subject: 'Daily Alerts Report from PermiShare', // Subject line
            html: '<p> Please find your Permishare alerts notifications attached to this email. Be sure to take action as necessary to ensure you remain in compliance. To view these alerts in your PermiShare account, <a href="https://portal.permishare.com/#/login">click here</a>.</p></br></br><b>- The PermiShare Team</b>', // html body
            attachments: [
                {
                    filename: 'Alerts Report_'+ new Date().toISOString().slice(0,10),
                    content: data_base64,
                    type: 'application/pdf',
                    disposition: 'attachment'
                }
            ]
        };
        sgMail.send(msg).then(() => {
            fs.unlink(pathoffile);
            return {"success":true};
        }).catch(error => {
            return {"success":false };
        });
        return {"success":true};
    } catch(err) {
        console.log(err);
        return {"success":false, "message": 'Something went wrong'};
    }
}

exports.addOrEditProfilePic = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                const Drivers = ORM.model('trs_tbl_drivers');
                let infoObject = JSON.parse(fields.driverInfo);
                return Drivers.findOne({where:{'driver_id':functions.decrypt(infoObject.driver_id) , "is_deleted":0,"carrier_id":infoObject.carrier_id}}).then(async driverData => {
                    if(driverData) {
                        let filestream = fs.createReadStream(files.profilePic.path);
                        let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['profilePic'].name.split(' ').join('_')
                        let params = {Bucket:"permishare/dev/driver-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                        let data = await uploadFile(params);
                        if(data.success) {
                            driverData['driver_profoile_pic_url'] = data.path;
                            return driverData.save({"validate":true , userId:"2b"}).then(savedData => {
                                return resolve({success:true , result:data.path});
                            }).catch(err => {
                                console.log(err);
                                return reject({success:false , message:"Something went wrong"});
                            })
                        }
                        else {
                            return reject({success:false , message:"Something went wrong"});
                        }
                    }
                    else {
                        return reject({success:false , message:"Driver not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                })
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.addOrEditProfilePicIos = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) {
                    console.error(err.message);
                    return reject({success:false , message:err.message});
                }
                const Drivers = ORM.model('trs_tbl_drivers');
                console.log(fields)
                // let infoObject = JSON.parse(fields.driverInfo);
                return Drivers.findOne({where:{'driver_id':functions.decrypt(fields.driver_id) , "is_deleted":0,"carrier_id":fields.carrier_id}}).then(async driverData => {
                    if(driverData) {
                        let filestream = fs.createReadStream(files.profilePic.path);
                        let namesToUpload = Date.now() + ( (Math.random()*100000).toFixed()) + '_' + files['profilePic'].name.split(' ').join('_')
                        let params = {Bucket:"permishare/dev/driver-documents" , Key:namesToUpload , Body:filestream, ACL:"public-read"};
                        console.log(params,"file upload done")
                        let data = await uploadFile(params);
                        if(data.success) {
                            driverData['driver_profoile_pic_url'] = data.path;
                            return driverData.save({"validate":true , userId:"2b"}).then(savedData => {
                                return resolve({success:true , result:data.path});
                            }).catch(err => {
                                console.log(err);
                                return reject({success:false , message:"Something went wrong"});
                            })
                        }
                        else {
                            return reject({success:false , message:"Something went wrong"});
                        }
                    }
                    else {
                        return reject({success:false , message:"Driver not found"});
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                })
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
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
                //console.log("here")
                return resolve({success:true , "path":data.Location,"name":data.Key.substr(data.Key.lastIndexOf('/')+1)});
            }
        });
    });
}

exports.addNewRecordInHistory = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.driverId) {
                return reject({success:false , message:"Invalid params"});
            }
            const msg = {
                to: data.shared_to_email,
                from: "no_reply@permishare.com",
                subject: 'Electronic Credential from ' + data.company_name,
                html: '<p>Hello,</p></br> <p>To access the requested electronic credential, click the secure link below:</p> </br><b>' + data.document_s3_url + '</b></br></br><p>-----</p><b>Sent via <a href="https://permishare.com">PermiShare</a> </b>', // html body,
            }
            sgMail.send(msg).then(() => {
                const DriverHistoryDocuments = ORM.model('trs_tbl_document_share_history');
                data.driver_id = functions.decrypt(data.driverId);
                delete data.driverId;
                delete data.document_s3_url;
                delete data.carrier_name;
                // delete data.email;
                delete data.sendingEmail;
                return DriverHistoryDocuments.create(data,{"validate":true}).then(addedRocordResp => {
                    return resolve({success:true , result:addedRocordResp});
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Someything went wrong"});
                })
                // return resolve({"success":true, "message": "Account activation link is sent to your email. please check"});
            }).catch(error => {
                return reject({"success":false, "message":"Failed to send verification link", "error": error.toString()});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.getDocsShareHistory = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            let queryWhere = {'carrier_id':data.carrier_id};
            let driverWhere = {};
            if(data.driver_last_name) {
                driverWhere['driver_last_name'] = {$like :'%'+ data.driver_last_name +'%'};
            }
            if(data.driver_first_name) {
                driverWhere['driver_first_name'] = {$like :'%'+ data.driver_first_name +'%'};
            }
            if(data.document_type) {
                queryWhere['document_type'] = data.document_type;
            }
            const History = ORM.model('trs_tbl_document_share_history');
            const Driver = ORM.model('trs_tbl_drivers');
            const DriverDocs = ORM.model('trs_tbl_driver_documents');
            const AssetDocs = ORM.model('trs_tbl_asset_documents');
            const corpDocs = ORM.model('trs_tbl_corporate_info_documents');
            return History.findAndCountAll({where:queryWhere,order:[['shared_date','DESC']],
            include : [
                {model:Driver ,where:driverWhere, on : {'$trs_tbl_document_share_history.driver_id$':{'$col':'trs_tbl_driver.driver_id'}}}
            ]
        }).then(async driverShareData => {
            let finalArray = [];
            for(let i = 0 ; i < driverShareData.rows.length ; i++){
                element = driverShareData.rows[i].get({plain:true});
                // console.log(element);
                if(element.document_type == 1) {
                    let documentDataForDriver = await DriverDocs.findOne({where:{'document_id':element.document_id}});
                    element.documentData = documentDataForDriver;
                }
                if(element.document_type == 2) {
                    let documentDataForDriver = await AssetDocs.findOne({where:{'asset_document_id':element.document_id}});
                    element.documentData = documentDataForDriver;
                }
                if(element.document_type == 3) {
                    let documentDataForDriver = await corpDocs.findOne({where:{'document_id':element.document_id}});
                    element.documentData = documentDataForDriver;
                }
                finalArray.push(element);
            }
            return resolve({success:true, results:finalArray});
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

exports.getDocsShareHistoryForMobile = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id || !data.driver_id) {
                return reject({success:false , message:"Invalid params"});
            }
            let queryWhere = {'carrier_id':data.carrier_id};
            let driverWhere = {};
            if(data.driver_last_name) {
                driverWhere['driver_last_name'] = {$like :'%'+ data.driver_last_name +'%'};
            }
            if(data.driver_first_name) {
                driverWhere['driver_first_name'] = {$like :'%'+ data.driver_first_name +'%'};
            }
            if(data.document_type) {
                queryWhere['document_type'] = data.document_type;
            }
            data.driver_id = functions.decrypt(data.driver_id);
            queryWhere['driver_id'] = data.driver_id;
            const History = ORM.model('trs_tbl_document_share_history');
            const Driver = ORM.model('trs_tbl_drivers');
            const DriverDocs = ORM.model('trs_tbl_driver_documents');
            const AssetDocs = ORM.model('trs_tbl_asset_documents');
            const corpDocs = ORM.model('trs_tbl_corporate_info_documents');
            return History.findAndCountAll({where:queryWhere,order:[['shared_date','DESC']],
            include : [
                {model:Driver ,where:driverWhere, on : {'$trs_tbl_document_share_history.driver_id$':{'$col':'trs_tbl_driver.driver_id'}}}
            ]
        }).then(async driverShareData => {
            let finalArray = [];
            for(let i = 0 ; i < driverShareData.rows.length ; i++){
                element = driverShareData.rows[i].get({plain:true});
                // console.log(element);
                if(element.document_type == 1) {
                    let documentDataForDriver = await DriverDocs.findOne({where:{'document_id':element.document_id}});
                    element.documentData = documentDataForDriver;
                }
                if(element.document_type == 2) {
                    let documentDataForDriver = await AssetDocs.findOne({where:{'asset_document_id':element.document_id}});
                    element.documentData = documentDataForDriver;
                }
                if(element.document_type == 3) {
                    let documentDataForDriver = await corpDocs.findOne({where:{'document_id':element.document_id}});
                    element.documentData = documentDataForDriver;
                }
                finalArray.push(element);
            }
            return resolve({success:true, results:finalArray});
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

exports.getAssetHistory = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            let queryWhere = {'carrier_id':data.carrier_id};
            let driverWhere = {};
            let assetWhere = {};
            if(data.asset_number_id) {
                queryWhere['asset_number_id'] = {$like :'%'+ data.asset_number_id +'%'};
            }
            queryWhere['is_deleted'] = 0;
            let orderBy = [['asset_id','ASC']]
            const History = ORM.model('trs_tbl_driver_asset_history');
            const Driver = ORM.model('trs_tbl_drivers');
            const Assets = ORM.model('trs_tbl_assets');
            return Assets.findAndCountAll({order:[['asset_id','ASC'],[{model:History},"date", "DESC"]],where:queryWhere,include : [
                {model:Driver ,required:false, on:{'$trs_tbl_assets.asset_id$':{'$col':'trs_tbl_drivers.current_active_asset_id'}}},
                {model:History , include : [
                    {model:Driver ,where:driverWhere, on : {'$trs_tbl_driver_asset_histories.driver_id$':{'$col':'trs_tbl_driver_asset_histories.trs_tbl_driver.driver_id'}}},
                    {model:Assets ,required:false,where:assetWhere, on : {'$trs_tbl_driver_asset_histories.asset_id$':{'$col':'trs_tbl_driver_asset_histories.trs_tbl_asset.asset_id'}}}
                ],on:{'$trs_tbl_assets.asset_id$':{'$col':'trs_tbl_driver_asset_histories.asset_id'}}}
            ]}).then(assetData => {
                return resolve({success:true , result:assetData.rows});
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
            // const AssetDocs = ORM.model('trs_tbl_asset_documents');
            // const corpDocs = ORM.model('trs_tbl_corporate_info_documents');
            // return History.findAndCountAll({where:queryWhere,order:orderBy,
            //     include : [
            //         {model:Driver ,where:driverWhere, on : {'$trs_tbl_driver_asset_history.driver_id$':{'$col':'trs_tbl_driver.driver_id'}}},
            //         {model:Assets ,required:false,where:assetWhere, on : {'$trs_tbl_driver_asset_history.asset_id$':{'$col':'trs_tbl_asset.asset_id'}}}
            //     ]
            // }).then(async assetData => {
            //     // console.log(assetData.rows)
            //     return resolve({success:true, results:assetData.rows});
            // }).catch(err => {
            //     console.log(err);
            //     return reject({success:false , message:"Something went wrong"});
            // })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.getAssetHistoryForMobile = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id || !data.driver_id) {
                return reject({success:false , message:"Invalid params"});
            }
            let queryWhere = {'carrier_id':data.carrier_id};
            data.driver_id = functions.decrypt(data.driver_id);
            let driverWhere = {};
            let assetWhere = {};
            if(data.asset_number_id) {
                queryWhere['asset_number_id'] = {$like :'%'+ data.asset_number_id +'%'};
            }
            queryWhere['driver_id'] = data.driver_id;
            let orderBy = [['asset_id','ASC']]
            const History = ORM.model('trs_tbl_driver_asset_history');
            const Driver = ORM.model('trs_tbl_drivers');
            const Assets = ORM.model('trs_tbl_assets');
            const assetsMake = ORM.model('trs_tbl_asset_make');
            const assetsType = ORM.model('trs_tbl_asset_type');
            return History.findAndCountAll({order:[['date','DESC']],where:queryWhere,include : [
                {model:Driver ,required:false, on:{'$trs_tbl_driver_asset_history.driver_id$':{'$col':'trs_tbl_driver.driver_id'}}},
                {model:Assets ,required:false, on : {'$trs_tbl_driver_asset_history.asset_id$':{'$col':'trs_tbl_asset.asset_id'}},include : [
                    {model:assetsType ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_asset.asset_type_id$' : {'$col':'trs_tbl_asset.trs_tbl_asset_type.asset_type_id'}}},
                    {model:assetsMake ,where: { 'is_deleted': 0 }, on:{'$trs_tbl_asset.asset_make_id$' : {'$col':'trs_tbl_asset.trs_tbl_asset_make.asset_make_id'}}}
                ]}
                
            ]}).then(assetData => {
                return resolve({success:true , result:assetData.rows});
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
            // const AssetDocs = ORM.model('trs_tbl_asset_documents');
            // const corpDocs = ORM.model('trs_tbl_corporate_info_documents');
            // return History.findAndCountAll({where:queryWhere,order:orderBy,
            //     include : [
            //         {model:Driver ,where:driverWhere, on : {'$trs_tbl_driver_asset_history.driver_id$':{'$col':'trs_tbl_driver.driver_id'}}},
            //         {model:Assets ,required:false,where:assetWhere, on : {'$trs_tbl_driver_asset_history.asset_id$':{'$col':'trs_tbl_asset.asset_id'}}}
            //     ]
            // }).then(async assetData => {
            //     // console.log(assetData.rows)
            //     return resolve({success:true, results:assetData.rows});
            // }).catch(err => {
            //     console.log(err);
            //     return reject({success:false , message:"Something went wrong"});
            // })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.addFirebaseId = function(req, key) {
    return new Promise(async function(resolve, reject) {
        try {
            let data = req.body;
            if (!data.driver_firebase_id || !data.driver_id) {
                return reject({ success: false, message: "Invalid parameters" });
            }
            const Drivers = ORM.model('trs_tbl_drivers');
            return Drivers.findOne({where:{'driver_id':functions.decrypt(data.driver_id)}}).then(driverReocrd => {
                driverReocrd['driver_firebase_id'] = data.driver_firebase_id;
                return driverReocrd.save({'validate':true , 'userId':'2b'}).then(saveDOne => {
                    return resolve({ success: true, message: "Successful" });        
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});    
                })
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
            return resolve({ success: true, message: "Successful" });
        } catch (error) {
            console.log(error);
            return reject({ "success": false, "message": "Something went wrong" });
        }
    });
}

async function notifyDrivers(carrierId) {
    try {
        if (!carrierId) {
            return { success: false, message: "Invalid parameters" };
        }
        const Drivers = ORM.model('trs_tbl_drivers');
        var FireBaseIds = [];
        let driverDoc = await Drivers.findAll({ where: { "carrier_id": carrierId } });
        if (driverDoc.length) {
            for (let i = 0; i < driverDoc.length; i++) {
                driverDoc[i] = driverDoc[i].get({ plain: true });
                if (driverDoc[i].driver_firebase_id && driverDoc[i].driver_firebase_id != '')
                FireBaseIds.push(driverDoc[i].driver_firebase_id);
            }
            
            let message = "You have new documents to download."
            var notificationObj = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                registration_ids: FireBaseIds,
                //collapse_key: 'your_collapse_key',
                
                notification: {
                    title: 'PermiShare',
                    body: message,
                    sound: 'default'
                },
                
                data: { //you can send only notification or only data(or include both)
                    title: 'PermiShare',
                    body: message,
                    sound: 'default'
                }
            }
            
            driverFCM.send(notificationObj, function(err, response) {
                if (err) {
                    console.log("Something went wrong!", err);
                    return err;
                } else {
                    console.log("Successfully sent with response: ", response);
                    return { success: true, message: "Successful", result: response };
                }
            });
            
        } else {
            return { success: false, message: "Driver not found" };
        }
    } catch (error) {
        console.log(error);
        return { "success": false, "message": "Something went wrong" };
    }
}