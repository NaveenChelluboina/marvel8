const ORM = require('../../associations/table_associations');
const functions = require('../../../lib/functions');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
// const sgMail = require('@sendgrid/mail');
var config = require('../../../config');
var Sequelize = require("sequelize");
var _ = require('underscore');
var param = process.argv[2];
var originurl = config[param];
var subscrI = "";
// sgMail.setApiKey(config['sendgridKey']);
sgMail.setApiKey(config['sendgridKey']);

exports.getSubscriptions = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.per_page || !("page" in data)) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let start_limit = parseInt(data.page) * parseInt(data.per_page);
            const Subscriptions = ORM.model('trs_tbl_carriers');
            const Packages = ORM.model('trs_tbl_packages');
            let queryWhere = {};
            let packageWhere = {};
            if(data.package_id)
            packageWhere['package_id'] = data.package_id;
            queryWhere['carrier_id'] = {$notIn:[1]};
            if(data.invoice_number) {
                queryWhere['invoice_number'] = {$like :'%'+data.invoice_number+'%'};
            }
            // console.log(queryWhere);
            Subscriptions.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere,
                include:[
                    {model:Packages ,where:packageWhere, on:{'$trs_tbl_carriers.package_id$':{'$col':'trs_tbl_package.package_id'}}}
                ]
            }).then(async (subscriptions) => {
                subscriptions.rows.forEach(element => {
                    element = element.get({plain:true});
                    // console.log(element);
                })
                return resolve({success:true , results:subscriptions.rows , count:subscriptions.count});
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

exports.getingleSubscriptions = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Pagination params missing"});
            }
            let queryWhere = {};
            queryWhere['carrier_id'] = data.carrier_id;
            const Subscriptions = ORM.model('trs_tbl_carriers');
            const Packages = ORM.model('trs_tbl_packages');
            Subscriptions.findOne({where: queryWhere,
                include:[
                    {model:Packages , on:{'$trs_tbl_carriers.package_id$':{'$col':'trs_tbl_package.package_id'}}}
                ]
            }).then(subscriptions => {
                return resolve({success:true , results:subscriptions});
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

exports.getClients = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(data.from) {
                const Subscriptions = ORM.model('trs_tbl_carriers');
                const States = ORM.model('trs_tbl_states');
                const Countries = ORM.model('trs_tbl_countries');
                const Packages = ORM.model('trs_tbl_packages');
                let queryWhere = {};
                queryWhere['carrier_id'] = {$notIn:[1,2,7,23]};
                if(data.package_id) {
                    queryWhere['package_id'] = parseInt(data.package_id);
                }
                Subscriptions.findAndCountAll({where:queryWhere,
                    include:[
                        {model:States ,attributes:["state_name"], on:{'$trs_tbl_carriers.state_id$':{'$col':'trs_tbl_state.state_id'}}},
                        {model:Countries ,attributes:["country_name"], on:{'$trs_tbl_carriers.country_id$':{'$col':'trs_tbl_country.country_id'}}},
                        {model:Packages , on:{'$trs_tbl_carriers.package_id$':{'$col':'trs_tbl_package.package_id'}}}
                    ]
                }).then(subscriptions => {
                    return resolve({success:true , results:subscriptions.rows , count:subscriptions.count});
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
            else {
                if(!data.per_page || !("page" in data)) {
                    return reject({success:false , message:"Pagination params missing"});
                }
                let start_limit = parseInt(data.page) * parseInt(data.per_page);
                const Subscriptions = ORM.model('trs_tbl_carriers');
                const States = ORM.model('trs_tbl_states');
                const Countries = ORM.model('trs_tbl_countries');
                const Packages = ORM.model('trs_tbl_packages');
                let queryWhere = {};
                let countryWhere = {};
                let stateWhere = {};
                queryWhere['carrier_id'] = {$notIn:[1,2,7,23]};
                if(data.city) {
                    queryWhere['city'] = { $like : '%' + data.city + '%'};
                }
                if(data.client_name) {
                    queryWhere['carrier_name'] = { $like : '%' + data.client_name + '%'};
                }
                if(data.country_id) {
                    countryWhere['country_id'] = data.country_id;
                }
                if(data.state_id) {
                    queryWhere['state_id'] = data.state_id;
                }
                if(data.package_id) {
                    queryWhere['package_id'] = parseInt(data.package_id);
                }
                // console.log(queryWhere);
                Subscriptions.findAndCountAll({limit:parseInt(data.per_page),offset:start_limit,where:queryWhere,
                    include:[
                        {model:States ,where:stateWhere,attributes:["state_name"], on:{'$trs_tbl_carriers.state_id$':{'$col':'trs_tbl_state.state_id'}}},
                        {model:Countries ,where:countryWhere,attributes:["country_name"], on:{'$trs_tbl_carriers.country_id$':{'$col':'trs_tbl_country.country_id'}}},
                        {model:Packages , on:{'$trs_tbl_carriers.package_id$':{'$col':'trs_tbl_package.package_id'}}}
                    ]
                }).then(subscriptions => {
                    return resolve({success:true , results:subscriptions.rows , count:subscriptions.count});
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong"});
                });
            }
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.getSubscriptionsFromDashboard = function(req) {
    return new Promise(async function(resolve,reject) {
        try { 
            const Subscriptions = ORM.model('trs_tbl_carriers');
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            return Subscriptions.findAndCountAll().then(sub => {
                if(sub.rows.length) {
                    for(let i = 1;i < sub.rows.length;i++) {
                        if(sub.rows[i].is_active) {
                            if(sub.rows[i].invoice_number !="Default") {
                                stripe.subscriptions.retrieve(sub.rows[i].stripe_subscription_id).then(stripeData => {
                                    if(stripeData.latest_invoice == sub.rows[i].invoice_number && new Date(stripeData.current_period_start * 1000) == sub.rows[i].start_date && new Date(stripeData.current_period_end * 1000) == sub.rows[i].end_date) {
                                        return resolve({success:true, message:"Successful"});
                                    }
                                    else {
                                        sub.rows[i].invoice_number = stripeData.latest_invoice;
                                        sub.rows[i]['start_date'] = new Date(stripeData.current_period_start * 1000);
                                        sub.rows[i]['end_date'] = new Date(stripeData.current_period_end * 1000);
                                        return sub.rows[i].save().then(saved => {
                                            // console.log("done");
                                            return resolve({success:true , message:"Data saved successfully"});
                                        }).catch(err => {
                                            console.log(err);
                                            return reject({success:false , message:"Something went wrong,aaa"});
                                        })
                                    }
                                }).catch(err => {
                                    console.log(err);
                                    return reject({success:false , message:"Something went wrong,bbb"})
                                })
                            }
                        }
                    }
                }
                else {
                    return resolve({success:true , results:[]});
                }
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.updateACarrierFromStripe = function(req) {
    return new Promise(async function(resolve,reject) {
        try { 
            const Subscriptions = ORM.model('trs_tbl_carriers');
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            return Subscriptions.findAndCountAll().then(sub => {
                if(sub.rows.length) {
                    for(let i = 1;i < sub.rows.length;i++) {
                        if(sub.rows[i].is_active) {
                            if(sub.rows[i].subscription_end_date) {                                
                                let d1 = new Date(sub.rows[i].subscription_end_date);
                                let d2 = new Date();
                                if(d2.getTime() > d1.getTime()) {
                                    sub.rows[i].is_active = 0;
                                    return sub.rows[i].save().then(saved => {
                                        // console.log("done");
                                        return resolve({success:true , message:"Data saved successfully"});
                                    }).catch(err => {
                                        console.log(err);
                                        return reject({success:false , message:"Something went wrong,aaa"});
                                    })
                                }
                            }
                        }
                    }
                }
                else {
                    return resolve({success:true , results:[]});
                }
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.getUpgradingPackages = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const Packages = ORM.model('trs_tbl_packages');
            if(data.from) {
                return Packages.findAndCountAll().then(sub => {
                    if(sub.rows.length) {
                        // console.log(sub.rows);
                        return resolve({success:true , results:sub.rows , count:sub.count});
                    }
                    else {
                        return resolve({success:true , results:[]});
                    }
                })
            }
            else {
                if(data.from_package) {
                    if(!data.packageId) {
                        return reject({success:false , message:"Invalid params"});
                    }
                    // console.log(data.packageId)
                    return Packages.findAndCountAll({where:{package_id:{$lt:data.packageId}}}).then(sub => {
                        if(sub.rows.length) {
                            // console.log(sub.rows);
                            return resolve({success:true , results:sub.rows , count:sub.count});
                        }
                        else {
                            return resolve({success:true , results:[]});
                        }
                    })
                }
                else {
                    if(!data.packageId) {
                        return reject({success:false , message:"Invalid params"});
                    }
                    // console.log(data.packageId)
                    return Packages.findAndCountAll({where:{package_id:{$gt:data.packageId}}}).then(sub => {
                        if(sub.rows.length) {
                            // console.log(sub.rows);
                            return resolve({success:true , results:sub.rows , count:sub.count});
                        }
                        else {
                            return resolve({success:true , results:[]});
                        }
                    })
                }
            }
            
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

exports.upgradePackageAndPlanForSubscriber = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            const Packages = ORM.model('trs_tbl_packages');
            if(!data.stripe_subscription_id || !data.stripe_plan_id || !data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            let subDetails = await getSubDetailsOfSub(data.stripe_subscription_id);
            // console.log(subDetails.results);
            stripe.subscriptions.update(data.stripe_subscription_id,{
                items:[{
                    id:subDetails.results.items.data[0].id,
                    plan:data.stripe_plan_id
                }]
            }).then(async (upgraded) => {
                // console.log(upgraded);
                let updatePackageForCarrier = await updateACarrierPackage(data.carrier_id , data.package_id);
                if(updatePackageForCarrier.success) 
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

function getSubDetailsOfSub(ID) {
    return new Promise(function(resolve,reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.subscriptions.retrieve(ID).then(subscr => {
                return resolve({success:true , results:subscr});
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

function updateACarrierPackage(carrierId,packageId) {
    return new Promise(function(resolve,reject) {
        try {
            const Carriers = ORM.model('trs_tbl_carriers');
            let queryWhere = {};
            queryWhere['carrier_id'] = carrierId;
            return Carriers.findOne({where:queryWhere}).then(carr => {
                carr['package_id'] = packageId;
                return carr.save().then(done => {
                    return resolve({success:true});
                }).catch(errs => {
                    console.log(errs);
                    return reject({success:false , message:"Something went wrong"});
                })
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

exports.unsubscribeAPackage = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let updateCurrentSubscription = await updateThisUSerSubscription(data.stripe_subscription_id,data.carrier_id);
            if(updateCurrentSubscription.success) {
                return resolve({success:true}); 
            }
            else {
                return reject({success:false});
            }
            // return resolve({success:true});
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function updateThisUSerSubscription(ID,CarID) {
    return new Promise(async function(resolve,reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            // let subObj = await subIds(ID);
            stripe.subscriptions.update(ID,{"cancel_at_period_end":true}).then(async updat => {
                // console.log(updat);
                let subObj = await subIds(updat,CarID);
                if(subObj.success)
                return resolve({success:true , result : updat});
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

function subIds(id,CarrirIDS) {
    return new Promise(function(resolve,reject) {
        try {
            const Carriers = ORM.model('trs_tbl_carriers');
            return Carriers.findOne({where:{'carrier_id':CarrirIDS}}).then(car => {
                car['subscription_end_date'] = new Date(id.cancel_at * 1000);
                return car.save().then(saved => {
                    // console.log("done");
                    return resolve({success:true , message:"Data saved successfully"});
                }).catch(err => {
                    console.log(err);
                    return reject({success:false , message:"Something went wrong,aaa"});
                })
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

exports.addANewCarrierFromAdmin = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let already_exists = await chechAlreadyExists(data.carrier_email);
            if(already_exists.success) {
                let carrierCreation = await createCarrier(data);
                if(carrierCreation.success) {
                    let CreateRolesForCarrier = await createRole(carrierCreation.results);
                    if(CreateRolesForCarrier.success) {
                        let NewUserCreation = await CreateUserForCarrier(CreateRolesForCarrier.results,data,carrierCreation.results);
                        if(NewUserCreation) {
                            let settingsForCarrier = await addSettings(carrierCreation.results,data.carrier_email);
                            if(settingsForCarrier.success) {
                                let gridColumnsForCarrier = await addGridColumnsInDriver(carrierCreation.results);
                                if(gridColumnsForCarrier.success) {
                                    let gridColumnsInAssets = await addGridColumnsInAssets(carrierCreation.results);
                                    if(gridColumnsInAssets.success) {
                                        return resolve({success:true , message:NewUserCreation.message});
                                    }
                                    else {
                                        return reject({success:false , message:"Something Went wrong"});    
                                    }
                                }
                                else {
                                    return reject({success:false , message:"Something Went wrong"});    
                                }
                            }
                            else {
                                return reject({success:false , message:"Something Went wrong"});    
                            }
                        }
                        else {
                            return reject({success:false , message:"Something Went wrong"});    
                        }
                    }
                    else {
                        return reject({success:false , message:"Something Went wrong"});    
                    }
                }
                else {
                    return reject({success:false , message:"Something went wrong"});
                }
            }
            else {
                return reject({success:false , message:"Carrier with email already exists"}); 
            }
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function createCarrier(carrierDetails) {
    return new Promise(function(resolve,reject) {
        try {
            const carriers = ORM.model('trs_tbl_carriers');
            return carriers.create(carrierDetails).then(data => {
                if(data) {
                    return resolve({success:true , results:data.carrier_id});   
                }
                else {
                    return reject({success:false , message:"Something went wrong"});
                }
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

function createRole(carrierId) {
    return new Promise(function(resolve,reject) {
        try {
            
            for(let i = 0; i < 2; i++) {
                if(i == 0) {
                    let finalObj = {};
                    finalObj['carrier_id'] = carrierId;
                    finalObj['role_name'] = "Super Admin";
                    const Roles = ORM.model('trs_tbl_roles');
                    ORM.getObj().transaction().then(function(t) {
                        return Roles.create(finalObj,{"validate":true , "userId":1, "transaction" : t}).then(async (role_res) => {
                            let perm_res = await allocatePermissions(role_res, t, 1,i);
                            if(perm_res.success) {
                                t.commit();
                                return resolve({success:perm_res , results:role_res.role_id});
                            } else {
                                return reject(perm_res);
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    })
                }
                else {
                    let finalObj = {};
                    finalObj['carrier_id'] = carrierId;
                    finalObj['role_name'] = "Read-Only";
                    const Roles = ORM.model('trs_tbl_roles');
                    ORM.getObj().transaction().then(function(t) {
                        return Roles.create(finalObj,{"validate":true , "userId":1, "transaction" : t}).then(async (role_res) => {
                            let perm_res = await allocatePermissions(role_res, t, 1,i);
                            if(perm_res.success) {
                                t.commit();
                                // return resolve({success:perm_res , results:role_res.role_id});
                            } else {
                                return reject(perm_res);
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({success:false , message:"Something went wrong"});
                        });
                    })
                }
                
                // if(i == 2)
                // finalObj['role_name'] = "Safety and Compliance";
                // if(i == 3)
                // finalObj['role_name'] = "Read-Only";
                
            }
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function allocatePermissions(roledata, t, userId,loopValue) {
    return new Promise(function(resolve, reject) {
        // console.log(roledata);
        const Permissions = ORM.model('trs_tbl_permissions');
        const RightMaster = ORM.model('trs_tbl_right_master');
        RightMaster.findAll({attributes:["right_master_id"], where:{ is_deleted: false}}).then(rights => {
            if(rights.length > 0) {
                let finalItems = [];
                if(loopValue == 0) {
                    for(let i=0; i< 11; i++) {
                        let item = { "right_master_id":rights[i].right_master_id, "role_id":roledata.role_id, "permission_type":'1111',"created_by":userId, "modified_by":userId};
                        finalItems.push(item);
                    }
                    for(let j=11; j<20; j++){
                        if(j == 19) {
                            let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'1111',"created_by":userId, "modified_by":userId};
                            finalItems.push(item);    
                        }
                        else {
                            let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'0000',"created_by":userId, "modified_by":userId};
                            finalItems.push(item);
                        }
                        
                    }
                }
                if(loopValue == 1) {
                    for(let i=0; i< 11; i++) {
                        let item = { "right_master_id":rights[i].right_master_id, "role_id":roledata.role_id, "permission_type":'0100',"created_by":userId, "modified_by":userId};
                        finalItems.push(item);
                    }
                    for(let j=11; j<20; j++){
                        if(j == 19) {
                            let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'0100',"created_by":userId, "modified_by":userId};
                            finalItems.push(item);
                        }
                        else {
                            let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'0000',"created_by":userId, "modified_by":userId};
                            finalItems.push(item);
                        }
                    }
                }
                // if(loopValue == 2) {
                //     for(let i=0; i< 11; i++) {
                //         let item = { "right_master_id":rights[i].right_master_id, "role_id":roledata.role_id, "permission_type":'1111',"created_by":userId, "modified_by":userId};
                //         finalItems.push(item);
                //     }
                //     for(let j=11; j<19; j++){
                //         if(j == 18) {
                //             let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'1111',"created_by":userId, "modified_by":userId};
                //             finalItems.push(item);    
                //         }
                //         else {
                //             let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'0000',"created_by":userId, "modified_by":userId};
                //             finalItems.push(item);
                //         }
                
                //     }
                // }
                // if(loopValue == 3) {
                //     for(let i=0; i< 11; i++) {
                //         let item = { "right_master_id":rights[i].right_master_id, "role_id":roledata.role_id, "permission_type":'1111',"created_by":userId, "modified_by":userId};
                //         finalItems.push(item);
                //     }
                //     for(let j=11; j<19; j++){
                //         if(j == 18) {
                //             let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'1111',"created_by":userId, "modified_by":userId};
                //             finalItems.push(item);    
                //         }
                //         else {
                //             let item = { "right_master_id":rights[j].right_master_id, "role_id":roledata.role_id, "permission_type":'0000',"created_by":userId, "modified_by":userId};
                //             finalItems.push(item);
                //         }
                
                //     }
                // }
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

function CreateUserForCarrier(roleId,details,carrierId) {
    return new Promise(function(resolve,reject) {
        try {
            let data = {};
            data['user_name'] = details.carrier_name;
            data['user_email'] = details.carrier_email;
            data['phone'] = details.carrier_phone;
            data['role_id'] = roleId;
            data['user_type'] = 2;
            data['carrier_id'] = carrierId;
            const Users = ORM.model('trs_tbl_users');
            // let requiredFields = ["user_id","is_deleted"];
            // let already_exists = await checkIfAlreadyExists(data, Users, requiredFields);
            // if(already_exists.success) {
            var accessToken = functions.randomValueBase64(20);
            let hash = bcrypt.hashSync(accessToken, 10);
            data.password_reset_token = hash;
            data.password = hash;
            Users.create(data,{"validate":true, "userId":1}).then(async (usrres) => {
                var token = functions.encrypt(accessToken);
                var uId = functions.encrypt(usrres.user_id.toString());
                var url = originurl + '/#/userverification?uid=' + uId + '&activationToken=' + token + '&sourceLocationInserted=1';
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
            // } else {
            //     return reject(already_exists);
            // }
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function getSendingEmail(carrierId) {
    return new Promise(function(resolve,reject) {
        const settings = ORM.model('trs_tbl_admin_settings');
        let queryWhere = {'settings_id':2};
        // console.log(queryWhere);
        return settings.findOne({where:queryWhere}).then(data => {
            return resolve({success:true , value :data.setting_value});
        }).catch(err => {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        })
    })
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
            return resolve({"success":true, "message": "Account activation link is sent to your email. Please check"});
        }).catch(error => {
            return reject({"success":false, "message":"Failed to send verification link", "error": error.toString()});
        });
    });
}

function addSettings(carrierID,email) {
    return new Promise(function(resolve,reject) {
        try {
            const Settings = ORM.model('trs_tbl_settings_for_carriers');
            let finalArray = [];
            for(let i = 1 ; i < 11 ; i++) {
                let finalObj = {};
                finalObj['settings_id'] = i;
                if(i == 1)
                finalObj['setting_value'] = 10;
                else if(i == 2 || i == 3 || i == 4)
                finalObj['setting_value'] = email;
                else 
                finalObj['setting_value'] = 30;
                finalObj['carrier_id'] = carrierID;
                finalObj['created_by'] = 1;
                finalObj['modified_by'] = 1;
                finalArray.push(finalObj);
            }
            return Settings.bulkCreate(finalArray,{"validate":true, "userId":1}).then(data => {
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

function addGridColumnsInDriver(carrierID) {
    return new Promise(function(resolve,reject) {
        try {
            // console.log(carrierID)
            const Drivers = ORM.model('trs_tbl_driver_grid_columns');
            let finalObj = {};
            finalObj['carrier_id'] = carrierID;
            finalObj['grid_columns'] = "111111111111";
            finalObj['created_by'] = 1;
            finalObj['modified_by'] = 1;
            // console.log(finalObj);
            return Drivers.create(finalObj,{"validate":true, "userId":1}).then(data => {
                return resolve({success:true});
            }).catch(err => {
                console.log(err);
                return reject({success:true , message:"Something went wrong"});
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function addGridColumnsInAssets(carrierID) {
    return new Promise(function(resolve,reject) {
        try {
            // console.log(carrierID);
            const Assets = ORM.model('trs_tbl_asset_grid_columns');
            let finalObj = {};
            finalObj['carrier_id'] = carrierID;
            finalObj['grid_columns'] = "11111111111111";
            finalObj['created_by'] = 1;
            finalObj['modified_by'] = 1;
            // console.log(finalObj);
            return Assets.create(finalObj,{"validate":true, "userId":1}).then(data => {
                return resolve({success:true});
            }).catch(err => {
                console.log(err);
                return reject({success:true , message:"Something went wrong"});
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    })
}

function chechAlreadyExists(emailID) {
    return new Promise(function(resolve,reject) {
        try {
            const Clients = ORM.model('trs_tbl_carriers');
            let queryWhere = {};
            queryWhere['carrier_email'] = emailID;
            return Clients.findAndCountAll({where:queryWhere}).then(data => {
                if(data.count) {
                    return resolve({success:false , message:"Record already exists"});
                }
                else {
                    return resolve({success:true , message:"Proceed"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:true , message:"Something went wrong"});
            })
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

exports.updateCarrierFromAdmin = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Carriers = ORM.model('trs_tbl_carriers');
            let queryWhere = {'carrier_id':data.carrier_id};
            return Carriers.findOne({where:queryWhere}).then(roles => {
                if(roles) {
                    delete data.carrier_id;
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

exports.convertClientIntoSubscriber = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            let packId = data.package_id;
            var convPackage = functions.encrypt(packId.toString());
            const Carriers = ORM.model('trs_tbl_carriers');
            var accessToken = functions.randomValueBase64(20);
            // let hash = bcrypt.hashSync(accessToken, 10);
            
            var token = functions.encrypt(accessToken);
            var cId = functions.encrypt(data.carrier_id.toString());
            var url = originurl + '/#/paymentpage/'+convPackage+'?cid=' + cId + '&activationToken=' + token;
            var email = data.carrier_email;
            var sending_email = await getSendingEmailForConversion(data.carrier_id);
            data.conversion_token = token;
            data.request_from = 0;
            var email_res = await sendConversionEmail(url, email, data.carrier_name,sending_email.value);
            return Carriers.findOne({where:{'carrier_id':data.carrier_id}}).then(carr => {
                if(carr) {
                    delete data.carrier_id;
                    for(let key in data) {
                        carr[key] = data[key];
                    }
                    return carr.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(savedData => {
                        if(email_res.success)
                        return resolve({success:true});
                        else 
                        return reject({success:false});
                    }).catch(err => {
                        console.log(err);
                        return reject({success:false , message:"Something went wrong"});
                    })
                }
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

function getSendingEmailForConversion(carrierId) {
    return new Promise(function(resolve,reject) {
        const settings = ORM.model('trs_tbl_admin_settings');
        let queryWhere = {'settings_id':2};
        // console.log(queryWhere);
        return settings.findOne({where:queryWhere}).then(data => {
            return resolve({success:true , value :data.setting_value});
        }).catch(err => {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        })
    })
}

function sendConversionEmail(url, email, name, sendingEmail) {
    return new Promise(function(resolve, reject) {
        const msg = {
            to: email,
            from: sendingEmail,
            subject: 'Account Conversion - PermiShare',
            html: '<p>Hello '+ functions.capitalizeString(name) +',</p></br> <p>Welcome to PermiShare, please click the below link to pay for your subscription.</p> </br><b>' + url + '</b></br></br><p>Thanks</p></br><b>PermiShare Support Team</b>' // html body
        };
        sgMail.send(msg).then(() => {
            return resolve({"success":true, "message": "Account conversion link is sent to your client's email."});
        }).catch(error => {
            return reject({"success":false, "message":"Failed to send conversion link", "error": error.toString()});
        });
    });
}

exports.checkUrlStatusForCarrier = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            // console.log(data);
            if(!data.carrierId || !data.accessToken)
            return reject({ success: false, message: 'Invalid params' });
            // console.log(data);
            let carrierId = functions.decrypt(data.carrierId);
            carrierId = Number(carrierId);
            let actoken = data.accessToken;
            const Carrier = ORM.model('trs_tbl_carriers');
            // console.log(actoken);
            // console.log(carrierId);
            return Carrier.findAll({attributes: ['conversion_token'], where:{"carrier_id":carrierId}}).then(userdata => {
                // console.log(userdata);
                if(userdata.length !== 0 &&  userdata[0].conversion_token != null) {
                    if(actoken == userdata[0].conversion_token) {
                        return resolve({ success: true, message: 'Url expired' });
                    } else {
                        return reject({ success: false, message: 'Url expired' });
                    }
                } else {
                    return reject({ success: false, message: 'Url expired' });
                }
            }).catch(err => {
                console.log(err);
                return { success: false, message: 'Url expired' };
            });
        } catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Url expired' });
        }
    })
}

exports.getSingleClient = function(req) {
    return new Promise(function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.carrier_id)
            return reject({success:false , message:"Invalid params"});
            let CarrierID = functions.decrypt(data.carrier_id);
            const Carrier = ORM.model("trs_tbl_carriers");
            return Carrier.findOne({where:{'carrier_id':CarrierID}}).then(carr => {
                if(carr) {
                    return resolve({success:true , results:carr});
                }
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