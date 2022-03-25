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
var subscrI = "";
// sgMail.setApiKey(config['sendgridKey']);
sgMail.setApiKey(config['sendgridKey']);
var originServerUrl = config[param + 'Serv'];
const winston = require('winston');
const appDetails = require('../../../app');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.makePayment = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            let already_exists = await chechAlreadyExists(data.carrier_details.carrier_email);
            if (already_exists.success) {
                let plain_id = await getPlanId(data.package_id);
                // let billingAmount = await getBillingAmount(plain_id.results);
                let customerId = await createCustomer(data.carrier_details);
                if (customerId.success) {
                    let IDCreated = customerId.results
                    let createSource = await createSources(customerId.results, data.token);
                    if (createSource.success) {
                        let subscriptioncreate = await createNewSubscription(customerId.results, plain_id.results);
                        if (subscriptioncreate.success) {
                            subscrI = subscriptioncreate.results.id;
                            let carrierCreate = await createCarrier(data.package_id, data.carrier_details, subscriptioncreate.results);
                            if (carrierCreate.success) {
                                let roleForCarrier = await createRole(carrierCreate.results);
                                if (roleForCarrier.success) {
                                    let NewUserCreation = await CreateUserForCarrier(roleForCarrier.results, data.carrier_details, carrierCreate.results);
                                    if (NewUserCreation) {
                                        let settingsForCarrier = await addSettings(carrierCreate.results, data.carrier_details.carrier_email);
                                        if (settingsForCarrier.success) {
                                            let gridColumnsForCarrier = await addGridColumnsInDriver(carrierCreate.results);
                                            if (gridColumnsForCarrier.success) {
                                                let gridColumnsInAssets = await addGridColumnsInAssets(carrierCreate.results);
                                                if (gridColumnsInAssets.success) {
                                                    return resolve({ success: true, message: NewUserCreation.message });
                                                }
                                                else {
                                                    return reject({ success: false, message: NewUserCreation.message });
                                                }
                                            }
                                            else {
                                                return reject({ success: false, message: NewUserCreation.message });
                                            }
                                        }
                                        else {
                                            return reject({ success: false, message: NewUserCreation.message });
                                        }
                                    }
                                    else {
                                        return reject({ success: false, message: NewUserCreation.message });
                                    }
                                }
                                else {
                                    return reject({ success: false, message: "Something went wrong" });
                                }
                            }
                            else {
                                return reject({ success: false, message: "Something went wrong" });
                            }
                        }
                        else {
                            stripe.customers.del(
                                IDCreated
                            ).then(data => {
                                return resolve({ success: true, message: "User deleted successfully", results: data.id });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: "Something went wrong" });
                            })
                            return reject({ success: false, message: "Something went wrong" });
                        }
                    }
                    else {
                        stripe.customers.del(
                            IDCreated
                        ).then(data => {
                            return resolve({ success: true, message: "User deleted successfully", results: data.id });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        })
                        return reject({ success: false, message: "Something went wrong" });
                    }
                }
                else {
                    return reject({ success: false, message: "Something went wrong" });
                }
            }
            else {
                return reject({ success: false, message: "Carrier with email already exists" });
            }
        }
        catch (err) {
            console.log(err);
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.subscriptions.retrieve(subscrI).then(subs => {
                stripe.invoices.retrieve(subs.latest_invoice).then(inv => {
                    stripe.refunds.create({ charge: inv.charge }).then(ref => {
                        if (ref.status == "succeeded") {
                            return resolve({ success: true, message: "Any amount debited will be refunded in 5-7 business days" });
                        }
                        else {
                            return reject({ success: false, message: "Something went wrong" });
                        }
                    })
                }).catch(errs => {
                    console.log(errs);
                    return reject({ success: false, message: "Something went wrong in invoice retrieving" });
                })
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong in retrieving" });
            })
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function createCustomer(customerDetails) {
    return new Promise(function (resolve, reject) {
        try {
            if (customerDetails.country_id == 38)
                customerDetails.country = "CA"
            else
                customerDetails.country = "USA"
            customerDetails.state = "British Columbia"
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.customers.create({
                name: customerDetails.carrier_name,
                email: customerDetails.carrier_email,
                phone: customerDetails.carrier_phone,
                tax_exempt: "exempt",
                address: {
                    line1: customerDetails.carrier_address,
                    city: customerDetails.city,
                    country: customerDetails.country,
                    state: customerDetails.state
                }
            }).then(customer => {
                return resolve({ success: true, results: customer.id });
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

function createSources(custId, token) {
    return new Promise(function (resolve, reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.customers.createSource(custId, {
                source: token
            }).then(data => {
                // console.log(data);
                return resolve({ success: true, message: "Success", results: data.id });
            }).catch(err => {
                console.log(err);
                return resolve({ success: false, message: "Fail" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function chargedAmount(custId, token, total) {
    return new Promise(function (resolve, reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.charges.create({
                amount: total,
                currency: "usd",
                customer: custId,
                description: "Initial charge",
                receipt_email: "sivakumar.k369@gmail.com",
                source: token,
                statement_descriptor_suffix: "Charge for stripe mon"
            }).then(data => {
                // console.log(data);
                return resolve({ success: true, results: data });
            }).catch(err => {
                console.log(err);
                return reject({ success: false });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function createProduct() {
    return new Promise(function (resolve, reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.products.create({
                name: "New Product",
                description: "This is a new product",
                type: "service"
            }).then(data => {
                // console.log(data);
                return resolve({ success: true, message: "done" });
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

function createNewPlan() {
    return new Promise(function (resolve, reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.plans.create({
                amount: 100 * 100,
                currency: 'USD',
                interval: 'day',
                product: {
                    // id:"prod_GtXgsVR90vafcb",
                    name: "New Product",
                }
            }).then(data => {
                // console.log(data);
                return resolve({ success: true, results: data });
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

function createNewSubscription(customer, plan) {
    return new Promise(function (resolve, reject) {
        try {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.subscriptions.create({
                customer: customer,
                items: [{
                    plan: plan
                }],
                collection_method: "charge_automatically"
            }).then(data => {
                return resolve({ success: true, message: "Success", results: data });
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

function createCarrier(packageId, carrierData, invoice) {
    return new Promise(function (resolve, reject) {
        try {
            let date = new Date();
            let date2 = new Date(date);
            carrierData['terms_and_conditions_acceptance_date'] = date2.setMinutes(date.getMinutes() - 240);
            const carriers = ORM.model('trs_tbl_carriers');
            carrierData['package_id'] = functions.decrypt(packageId);
            carrierData['invoice_number'] = invoice.latest_invoice;
            carrierData['start_date'] = new Date(invoice.start_date * 1000);
            carrierData['end_date'] = new Date(invoice.current_period_end * 1000);
            carrierData['stripe_subscription_id'] = invoice.id;

            return carriers.create(carrierData).then(data => {
                if (data) {
                    return resolve({ success: true, results: data.carrier_id });
                }
                else {
                    return reject({ success: false, message: "Something went wrong" });
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

function getPlanId(ID) {
    return new Promise(function (resolve, reject) {
        const Plans = ORM.model('trs_tbl_packages');
        Plans.findOne({ where: { 'package_id': functions.decrypt(ID) } }).then(data => {
            return resolve({ success: true, results: data.stripe_plan_id });
        }).catch(err => {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        })
    })
}

function getBillingAmount(ID) {
    try {
        return new Promise(function (resolve, reject) {
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.plans.retrieve(
                ID
            ).then(data => {
                if (data.id)
                    return resolve({ success: true, results: data.amount });
                else
                    return reject({ success: false, message: "Something went wrong" });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            })
        })
    }
    catch (error) {
        console.log(error);
        return reject({ success: false, message: "Something went wrong" });
    }

}

function createRole(carrierId) {
    return new Promise(function (resolve, reject) {
        try {

            for (let i = 0; i < 2; i++) {
                if (i == 0) {
                    let finalObj = {};
                    finalObj['carrier_id'] = carrierId;
                    finalObj['role_name'] = "Super Admin";
                    const Roles = ORM.model('trs_tbl_roles');
                    ORM.getObj().transaction().then(function (t) {
                        return Roles.create(finalObj, { "validate": true, "userId": 1, "transaction": t }).then(async (role_res) => {
                            let perm_res = await allocatePermissions(role_res, t, 1, i);
                            if (perm_res.success) {
                                t.commit();
                                return resolve({ success: perm_res, results: role_res.role_id });
                            } else {
                                return reject(perm_res);
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        });
                    })
                }
                else {
                    let finalObj = {};
                    finalObj['carrier_id'] = carrierId;
                    finalObj['role_name'] = "Read-Only";
                    const Roles = ORM.model('trs_tbl_roles');
                    ORM.getObj().transaction().then(function (t) {
                        return Roles.create(finalObj, { "validate": true, "userId": 1, "transaction": t }).then(async (role_res) => {
                            let perm_res = await allocatePermissions(role_res, t, 1, i);
                            if (perm_res.success) {
                                t.commit();
                                // return resolve({success:perm_res , results:role_res.role_id});
                            } else {
                                return reject(perm_res);
                            }
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        });
                    })
                }

                // if(i == 2)
                // finalObj['role_name'] = "Safety and Compliance";
                // if(i == 3)
                // finalObj['role_name'] = "Read-Only";

            }
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function allocatePermissions(roledata, t, userId, loopValue) {
    return new Promise(function (resolve, reject) {
        // console.log(roledata);
        const Permissions = ORM.model('trs_tbl_permissions');
        const RightMaster = ORM.model('trs_tbl_right_master');
        RightMaster.findAll({ attributes: ["right_master_id"], where: { is_deleted: false } }).then(rights => {
            if (rights.length > 0) {
                let finalItems = [];
                if (loopValue == 0) {
                    for (let i = 0; i < 11; i++) {
                        let item = { "right_master_id": rights[i].right_master_id, "role_id": roledata.role_id, "permission_type": '1111', "created_by": userId, "modified_by": userId };
                        finalItems.push(item);
                    }
                    for (let j = 11; j < 20; j++) {
                        if (j == 18 || j == 19) {
                            let item = { "right_master_id": rights[j].right_master_id, "role_id": roledata.role_id, "permission_type": '1111', "created_by": userId, "modified_by": userId };
                            finalItems.push(item);
                        }
                        else {
                            let item = { "right_master_id": rights[j].right_master_id, "role_id": roledata.role_id, "permission_type": '0000', "created_by": userId, "modified_by": userId };
                            finalItems.push(item);
                        }

                    }
                }
                if (loopValue == 1) {
                    for (let i = 0; i < 11; i++) {
                        let item = { "right_master_id": rights[i].right_master_id, "role_id": roledata.role_id, "permission_type": '0100', "created_by": userId, "modified_by": userId };
                        finalItems.push(item);
                    }
                    for (let j = 11; j < 20; j++) {
                        if (j == 18 || j == 19) {
                            let item = { "right_master_id": rights[j].right_master_id, "role_id": roledata.role_id, "permission_type": '0100', "created_by": userId, "modified_by": userId };
                            finalItems.push(item);
                        }
                        else {
                            let item = { "right_master_id": rights[j].right_master_id, "role_id": roledata.role_id, "permission_type": '0000', "created_by": userId, "modified_by": userId };
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
                Permissions.bulkCreate(finalItems, { "validate": true, "userId": userId, "transaction": t }).then(perm_res => {
                    return resolve({ "success": true });
                }).catch(err => {
                    console.log(err);
                    return reject({ "success": false, "message": 'Something went wrong' });
                });
            } else {
                return reject({ "success": false, "message": "No permissions exists." });
            }
        }).catch(err => {
            console.log(err);
            return reject({ "success": false, "message": 'Something went wrong' });
        })
    });
}

function CreateUserForCarrier(roleId, details, carrierId) {
    return new Promise(function (resolve, reject) {
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
            Users.create(data, { "validate": true, "userId": 1 }).then(async (usrres) => {
                var token = functions.encrypt(accessToken);
                var uId = functions.encrypt(usrres.user_id.toString());
                var url = originurl + '/#/userverification?uid=' + uId + '&activationToken=' + token;
                var email = data.user_email;
                let sending_email = await getSendingEmail(data.carrier_id);
                let email_res = await sendActivationEmail(url, email, data.user_name, sending_email.value);
                let company_copy = await sendActivationEmail(url, "support@permishare.com", data.user_name, sending_email.value);
                if (email_res.success && company_copy.success) {
                    return resolve(email_res);
                } else {
                    return reject(email_res);
                }
            }).catch(err => {
                console.log(err);
                return reject({ "success": false, "message": 'Something went wrong' });
            });
            // } else {
            //     return reject(already_exists);
            // }
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function getSendingEmail(carrierId) {
    return new Promise(function (resolve, reject) {
        const settings = ORM.model('trs_tbl_admin_settings');
        let queryWhere = { 'settings_id': 2 };
        // console.log(queryWhere);
        return settings.findOne({ where: queryWhere }).then(data => {
            return resolve({ success: true, value: data.setting_value });
        }).catch(err => {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        })
    })
}

function sendActivationEmail(url, email, name, sendingEmail) {
    return new Promise(function (resolve, reject) {
        const msg = {
            to: email,
            from: sendingEmail,
            subject: 'Account Activation - PermiShare',
            html: '<p>Hello ' + functions.capitalizeString(name) + ',</p></br> <p>Welcome to PermiShare, please click the below link to activate your account.</p> </br><b>' + url + '</b></br></br><p>Thanks</p></br><b>PermiShare Support Team</b>' // html body
        };
        sgMail.send(msg).then(() => {
            return resolve({ "success": true, "message": "Account activation link is sent to your email. Please check" });
        }).catch(error => {
            return reject({ "success": false, "message": "Failed to send verification link", "error": error.toString() });
        });
    });
}

function addSettings(carrierID, email) {
    return new Promise(function (resolve, reject) {
        try {
            const Settings = ORM.model('trs_tbl_settings_for_carriers');
            let finalArray = [];
            for (let i = 1; i < 11; i++) {
                let finalObj = {};
                finalObj['settings_id'] = i;
                if (i == 1)
                    finalObj['setting_value'] = 10;
                else if (i == 2 || i == 3 || i == 4)
                    finalObj['setting_value'] = email;
                else
                    finalObj['setting_value'] = 30;
                finalObj['carrier_id'] = carrierID;
                finalObj['created_by'] = 1;
                finalObj['modified_by'] = 1;
                finalArray.push(finalObj);
            }
            return Settings.bulkCreate(finalArray, { "validate": true, "userId": 1 }).then(data => {
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

function addGridColumnsInDriver(carrierID) {
    return new Promise(function (resolve, reject) {
        try {
            // console.log(carrierID)
            const Drivers = ORM.model('trs_tbl_driver_grid_columns');
            let finalObj = {};
            finalObj['carrier_id'] = carrierID;
            finalObj['grid_columns'] = "111111111111";
            finalObj['created_by'] = 1;
            finalObj['modified_by'] = 1;
            // console.log(finalObj);
            return Drivers.create(finalObj, { "validate": true, "userId": 1 }).then(data => {
                return resolve({ success: true });
            }).catch(err => {
                console.log(err);
                return reject({ success: true, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function addGridColumnsInAssets(carrierID) {
    return new Promise(function (resolve, reject) {
        try {
            // console.log(carrierID);
            const Assets = ORM.model('trs_tbl_asset_grid_columns');
            let finalObj = {};
            finalObj['carrier_id'] = carrierID;
            finalObj['grid_columns'] = "11111111111111";
            finalObj['created_by'] = 1;
            finalObj['modified_by'] = 1;
            // console.log(finalObj);
            return Assets.create(finalObj, { "validate": true, "userId": 1 }).then(data => {
                return resolve({ success: true });
            }).catch(err => {
                console.log(err);
                return reject({ success: true, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function chechAlreadyExists(emailID) {
    return new Promise(function (resolve, reject) {
        try {
            const Clients = ORM.model('trs_tbl_carriers');
            let queryWhere = {};
            queryWhere['carrier_email'] = emailID;
            return Clients.findAndCountAll({ where: queryWhere }).then(data => {
                if (data.count) {
                    return resolve({ success: false, message: "Record already exists" });
                }
                else {
                    return resolve({ success: true, message: "Proceed" });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: true, message: "Something went wrong" });
            })
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    });
}

exports.makeNewPaymentForAClient = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            // let already_exists = await chechAlreadyExists(data.carrier_details.carrier_email);

            let plain_id = await getPlanId(data.package_id);
            // let billingAmount = await getBillingAmount(plain_id.results);
            let customerId = await createCustomer(data.carrier_details);
            if (customerId.success) {
                let IDCreated = customerId.results
                let createSource = await createSources(customerId.results, data.token);
                if (createSource.success) {
                    let subscriptioncreate = await createNewSubscription(customerId.results, plain_id.results);
                    if (subscriptioncreate.success) {
                        subscrI = subscriptioncreate.results.id;
                        let updatingCarrierForIDs = await updateCarrierForNewDetails(data.carrier_id, subscriptioncreate.results);
                        if (updatingCarrierForIDs.success) {
                            let updatePermissionsForSubscriptionOnPayment = await updatePermissionsForUserOnPayment(data.carrier_id);
                            if (updatePermissionsForSubscriptionOnPayment.success) {
                                return resolve({ success: true, message: "Payment done successfully" });
                            }
                            else {
                                stripe.customers.del(
                                    IDCreated
                                ).then(data => {
                                    return resolve({ success: true, message: "User deleted successfully", results: data.id });
                                }).catch(err => {
                                    console.log(err);
                                    return reject({ success: false, message: "Something went wrong" });
                                })
                                return reject({ success: false, message: "Something went wrong" });
                            }
                        }
                        else {
                            stripe.customers.del(
                                IDCreated
                            ).then(data => {
                                return resolve({ success: true, message: "User deleted successfully", results: data.id });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: "Something went wrong" });
                            })
                            return reject({ success: false, message: "Something went wrong" });
                        }
                    }
                    else {
                        stripe.customers.del(
                            IDCreated
                        ).then(data => {
                            return resolve({ success: true, message: "User deleted successfully", results: data.id });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: "Something went wrong" });
                        })
                        return reject({ success: false, message: "Something went wrong" });
                    }
                }
                else {
                    stripe.customers.del(
                        IDCreated
                    ).then(data => {
                        return resolve({ success: true, message: "User deleted successfully", results: data.id });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: "Something went wrong" });
                    })
                    return reject({ success: false, message: "Something went wrong" });
                }
            }
            else {
                return reject({ success: false, message: "Something went wrong" });
            }

        }
        catch (err) {
            console.log(err);
            const stripe = require("stripe")("sk_live_Iw8TRrhao66ONgP72M7czXmJ00L0Uni0Zi");
            stripe.subscriptions.retrieve(subscrI).then(subs => {
                stripe.invoices.retrieve(subs.latest_invoice).then(inv => {
                    stripe.refunds.create({ charge: inv.charge }).then(ref => {
                        if (ref.status == "succeeded") {
                            return resolve({ success: true, message: "Any amount debited will be refunded in 5-7 business days" });
                        }
                        else {
                            return reject({ success: false, message: "Something went wrong" });
                        }
                    })
                }).catch(errs => {
                    console.log(errs);
                    return reject({ success: false, message: "Something went wrong in invoice retrieving" });
                })
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong in retrieving" });
            })
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

function updateCarrierForNewDetails(carrierID, invoice) {
    return new Promise(function (resolve, reject) {
        try {
            // console.log(carrierID,invoice);
            const Carriers = ORM.model("trs_tbl_carriers");
            return Carriers.findOne({ where: { 'carrier_id': functions.decrypt(carrierID) } }).then(OldCarrierFound => {
                if (OldCarrierFound) {
                    var token = OldCarrierFound.conversion_token;
                    // console.log(carrierData);
                    OldCarrierFound['invoice_number'] = invoice.latest_invoice;
                    OldCarrierFound['start_date'] = new Date(invoice.start_date * 1000);
                    OldCarrierFound['end_date'] = new Date(invoice.current_period_end * 1000);
                    OldCarrierFound['stripe_subscription_id'] = invoice.id;
                    OldCarrierFound['request_from'] = 0;
                    OldCarrierFound['conversion_token'] = null;
                    return OldCarrierFound.save({ "validate": true, "userId": 1 }).then(savedResult => {
                        // console.log("Entered");
                        return resolve({ success: true });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: "Something went wrongggggg" });
                    });
                }
            }).catch(err => {

                console.log(err);
                return reject({ success: false, message: "Something went wrongeeee" });
            });
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrongffff" });
        }
    })
}

function updatePermissionsForUserOnPayment(carrierId) {
    return new Promise(function (resolve, reject) {
        try {
            const Roles = ORM.model('trs_tbl_roles');
            const permissions = ORM.model('trs_tbl_permissions');
            return Roles.findOne({ where: { 'carrier_id': functions.decrypt(carrierId), 'is_deleted': 0 } }).then(role => {
                if (role) {
                    return permissions.findOne({ where: { 'role_id': role.role_id, 'right_master_id': 19 } }).then(permi => {
                        if (permi) {
                            permi['permission_type'] = '1111';
                            return permi.save({ "validate": true, "userId": 1 }).then(permiShareDone => {
                                return resolve({ success: true });
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: "Something went wrong" });
                            });
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: "Something went wrong" });
                    });
                }
                else {
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: "Something went wrong" });
            });
        }
        catch (error) {
            console.log(error);
            return reject({ success: false, message: "Something went wrong" });
        }
    })
}

exports.updateGridColumnsForClientsScreen = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {}
            const ClientGrids = ORM.model('trs_tbl_super_admin_clients_grid_columns');
            return ClientGrids.findOne({ where: queryWhere }).then(roles => {
                if (roles) {
                    delete data.grid_column_id;
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
                    return reject({ success: false, message: "Table not found" });
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

exports.getGridColumnsForClientsScreen = function (req) {
    return new Promise(async function (resolve, reject) {
        try {
            let data = req.body;
            let queryWhere = {};
            const ClientGrids = ORM.model('trs_tbl_super_admin_clients_grid_columns');
            return ClientGrids.findAndCountAll({ where: queryWhere }).then(states => {
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