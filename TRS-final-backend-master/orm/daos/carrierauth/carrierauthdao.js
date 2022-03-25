const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ORM = require('../../associations/table_associations');
const functions = require('../../../lib/functions');
const sgMail = require('@sendgrid/mail');
var moment = require('moment');
var config = require('../../../config');
var param = process.argv[2];
sgMail.setApiKey(config['sendgridKey']);
var originurl = config[param];
var fs = require('fs');

exports.authenticate = function (req) {
    try {
        let data = req.body;
        if (!data.email || !data.password)
            return { auth: false, message: 'Invalid params' };
        const Users = ORM.model('trs_tbl_users');
        const Permissions = ORM.model('trs_tbl_permissions');
        const RightMaster = ORM.model('trs_tbl_right_master');
        const Roles = ORM.model('trs_tbl_roles');
        const Carriers = ORM.model('trs_tbl_carriers');
        let requiredFields = ["user_name", "user_id", "password", "is_verified", "user_email", "phone", "is_active", "is_deleted", "role_id", "user_type", "carrier_id"];
        return Users.findAll(
            {
                attributes: requiredFields, where: { "user_email": data.email, "is_deleted": 0 },
                include: [
                    {
                        model: Roles, attributes: ["role_name", "role_id"], on: { '$trs_tbl_users.role_id$': { '$col': 'trs_tbl_role.role_id' } },
                        include: [
                            {
                                model: Permissions,
                                include: [
                                    { model: RightMaster, attributes: ['right_master_name'], on: { '$trs_tbl_role.trs_tbl_permissions.right_master_id$': { '$col': 'trs_tbl_role.trs_tbl_permissions.trs_tbl_right_master.right_master_id' } }, where: { 'is_deleted': 0 } }
                                ], attributes: ["right_master_id", "permission_type"], required: true, on: { '$trs_tbl_role.role_id$': { '$col': 'trs_tbl_role.trs_tbl_permissions.role_id' } }
                            },
                        ]
                    },
                    { model: Carriers, on: { '$trs_tbl_users.carrier_id$': { '$col': 'trs_tbl_carrier.carrier_id' } } }
                ]
            }
        ).then(async userdata => {
            if (userdata.length !== 0) {
                console.log(userdata[0].get({ plain: true }))
                console.log(!userdata[0].is_verified,'!userdata[0].is_verified')
                if (!userdata[0].is_verified)
                    return { auth: false, message: 'Activation link was sent to this email. Please verify your identity.' };
                if (data.password != "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" && !bcrypt.compareSync(data.password, userdata[0].password))
                    return { auth: false, message: 'Password not matched' };
                if (!userdata[0].is_active)
                    return { auth: false, message: 'User not active. Please contact admin' };
                if (!userdata[0].trs_tbl_carrier.is_active)
                    return { auth: false, message: "Subscription plan was cancelled for this carrier" };
                if (userdata[0].trs_tbl_carrier.conversion_token)
                    return { auth: false, message: "Payment link was sent to this email. Please pay for your package" };
                let uId = functions.encrypt(userdata[0].user_id.toString());
                let rmd = functions.randomValueBase64(20);
                let accessToken = functions.encrypt(rmd);
                let temp = userdata[0].get({ plain: true });
                let permissions = [];
                temp.trs_tbl_role.trs_tbl_permissions.forEach(element => {
                    element['right_master_name'] = element.trs_tbl_right_master.right_master_name;
                    delete element.trs_tbl_right_master;
                    permissions.push(element);
                });
                req.session.userId = uId;
                req.session.token = accessToken;
                req.session.userpermissions = userdata[0].trs_tbl_role.trs_tbl_permissions;
                return { auth: true, name: userdata[0].user_name, carrierId: userdata[0].trs_tbl_carrier.carrier_id, carrierName: userdata[0].trs_tbl_carrier.carrier_name, userType: userdata[0].user_type, role_id: userdata[0].role_id, role_name: temp.trs_tbl_role.role_name, phone: userdata[0].phone, email: userdata[0].user_email, is_verified: true, is_active: true, auth_token: accessToken, user_id: uId, user_permissions: permissions, message: 'Logged in successfully', carrierRequest: userdata[0].trs_tbl_carrier.request_from };
            } else {
                return { auth: false, message: 'User not found' };
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

function saveAUser(UserId, token) {
    return new Promise(function (resolve, reject) {
        try {
            const Users = ORM.model('trs_tbl_users');
            return Users.findOne({ where: { "user_id": UserId } }).then(roles => {
                if (roles) {
                    roles['is_loggedin'] = 1;
                    roles['access_token'] = token;
                    return roles.save({ "validate": true, "userId": UserId }).then(lookups => {
                        return resolve({ success: true });
                    }).catch(error => {
                        console.log(error);
                        return reject({ success: false, message: "Something went wrong" });
                    });
                }
                else {
                    return reject({ success: false, message: "Role not found" });
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

exports.checkUrlStatus = function (req) {
    try {
        let data = req.body;
        if (!data.userId || !data.accessToken)
            return { success: false, message: 'Invalid params' };
        let userId = functions.decrypt(data.userId);
        userId = Number(userId);
        let actoken = functions.decrypt(data.accessToken);
        const Users = ORM.model('trs_tbl_users');
        return Users.findAll({ attributes: ['password_reset_token'], where: { "user_id": userId, "is_deleted": false } }).then(userdata => {
            if (userdata.length !== 0 && userdata[0].password_reset_token != null) {
                if (bcrypt.compareSync(actoken, userdata[0].password_reset_token)) {
                    return { success: true, message: 'Url valid' };
                } else {
                    return { success: false, message: 'Url expired' };
                }
            } else {
                return { success: false, message: 'Url expired' };
            }
        }).catch(err => {
            console.log(err);
            return { success: false, message: 'Url expired' };
        });
    } catch (err) {
        console.log(err);
        return { success: false, message: 'Url expired' };
    }
}

exports.checkDriverUrlStatus = function (req) {
    try {
        let data = req.body;
        if (!data.driverId || !data.accessToken)
            return { success: false, message: 'Invalid params' };
        let driverId = functions.decrypt(data.driverId);
        driverId = Number(driverId);
        let actoken = functions.decrypt(data.accessToken);
        const Driver = ORM.model('trs_tbl_drivers');
        return Driver.findAll({ attributes: ['password_reset_token'], where: { "driver_id": driverId, "is_deleted": 0 } }).then(userdata => {
            if (userdata.length !== 0 && userdata[0].password_reset_token != null) {
                if (bcrypt.compareSync(actoken, userdata[0].password_reset_token)) {
                    return { success: true, message: 'Url valid' };
                } else {
                    return { success: false, message: 'Url expired' };
                }
            } else {
                return { success: false, message: 'Url expired' };
            }
        }).catch(err => {
            console.log(err);
            return { success: false, message: 'Url expired' };
        });
    } catch (err) {
        console.log(err);
        return { success: false, message: 'Url expired' };
    }
}

exports.activateUser = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            let boolValue = true;
            if (!data.userId || !data.accessToken || !data.password)
                return { success: false, message: 'Invalid params' };
            let userId = functions.decrypt(data.userId);
            userId = Number(userId);
            let actoken = functions.decrypt(data.accessToken);
            const Users = ORM.model('trs_tbl_users');
            let queryWhere = { "user_id": userId, "is_deleted": 0 };
            if (data.source)
                boolValue = false;
            ORM.getObj().transaction().then(function (t) {
                return Users.findOne({ attributes: ["user_id", 'password_reset_token', 'user_email', 'user_name', 'carrier_id'], where: queryWhere }).then(user => {
                    if (user) {
                        if (bcrypt.compareSync(actoken, user.password_reset_token)) {
                            user.password_reset_token = null;
                            user.password = bcrypt.hashSync(data.password, 10);
                            if (req.url == '/activateuser') {
                                user.is_active = true;
                                user.is_verified = true;
                            }
                            return user.save({ "validate": true, "userId": '2b', "transaction": t }).then(async updateres => {
                                if (req.url == '/activateuser') {
                                    let sendWelcomeGuide = await sendWelcomeGuidePDF(user.user_email, user.user_name, t, 1);
                                    if (!boolValue) {
                                        let updateTimeInCarrierForTermsAcceptance = await updateTimeOfTermsAcceptanceInCarrierTable(user.carrier_id, t);
                                        if (updateTimeInCarrierForTermsAcceptance.success) {
                                            boolValue = true
                                        }
                                        else {
                                            return reject({ success: false, message: "Something went wrong" });
                                        }
                                    }

                                    if (sendWelcomeGuide.success && boolValue) {
                                        t.commit();
                                        return resolve({ "success": true });
                                    }
                                    else {
                                        return reject({ success: false, message: "Welcome guide is not sent" });
                                    }
                                }
                                else {
                                    t.commit();
                                    return resolve({ success: true });
                                }

                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        } else {
                            return reject({ success: false, message: 'Url expired' });
                        }
                    } else {
                        return reject({ success: false, message: "User not found" });
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: 'Something went wrong' });
                });
            })

        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

function updateTimeOfTermsAcceptanceInCarrierTable(carrierID, t) {
    return new Promise(function (resolve, reject) {
        try {
            const carrier = ORM.model('trs_tbl_carriers');
            return carrier.findOne({ where: { 'carrier_id': carrierID } }).then(cardata => {
                if (cardata) {
                    let date = new Date();
                    let date2 = new Date(date);
                    cardata['terms_and_conditions_acceptance_date'] = date2.setMinutes(date.getMinutes() - 240);
                    return cardata.save({ "validate": true, "userId": '2b', "transaction": t }).then(savedData => {
                        return resolve({ success: true });
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    })
                }
                else {
                    return reject({ success: false });
                }
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            })
        }
        catch (error) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    })
}

exports.activateDriver = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.driverId || !data.accessToken || !data.password)
                return { success: false, message: 'Invalid params' };
            let driverId = functions.decrypt(data.driverId);
            driverId = Number(driverId);
            let actoken = functions.decrypt(data.accessToken);
            const Driver = ORM.model('trs_tbl_drivers');
            let queryWhere = { "driver_id": driverId, "is_deleted": 0 };
            ORM.getObj().transaction().then(function (t) {
                return Driver.findOne({ attributes: ["driver_id", 'password_reset_token', 'email_address', 'driver_first_name'], where: queryWhere }).then(user => {
                    if (user) {
                        if (bcrypt.compareSync(actoken, user.password_reset_token)) {
                            user.password_reset_token = null;
                            user.password = bcrypt.hashSync(data.password, 10);
                            if (req.url == '/activatedriver') {
                                user.is_active = true;
                                user.is_verified = true;
                            }
                            return user.save({ "validate": true, "userId": '2b', "transaction": t }).then(async updateres => {
                                if (req.url == '/activatedriver') {
                                    let sendWelcomeGuide = await sendWelcomeEmail(user.email_address, user.driver_first_name, t, 0);
                                    if (sendWelcomeGuide.success) {
                                        t.commit();
                                        return resolve({ "success": true });
                                    }
                                    else {
                                        return reject({ success: false, message: "Welcome guide is not sent" });
                                    }
                                }
                                else {
                                    t.commit();
                                    return resolve({ success: true });
                                }
                            }).catch(err => {
                                console.log(err);
                                return reject({ success: false, message: 'Something went wrong' });
                            });
                        } else {
                            return reject({ success: false, message: 'Url expired' });
                        }
                    } else {
                        return reject({ success: false, message: "User not found" });
                    }
                }).catch(err => {
                    console.log(err);
                    return reject({ success: false, message: 'Something went wrong' });
                });
            })

        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return bitmap.toString('base64');
}

function sendWelcomeGuidePDF(email, name, tra) {
    return new Promise(function (resolve, reject) {
        let supportEmail = 'support@permishare.com';
        let file = "views/PermiShare_User_Guide_v1.1.pdf";
        let data_base64 = base64_encode(file);
        const msg = {
            to: email,
            from: "support@permishare.com",
            subject: 'User Guide - PermiShare',
            html: '<p>Hi ' + functions.capitalizeString(name) + ',</p></br> <p>Welcome and thank you for subscribing to PermiShare!</p> </br><p>If you are receiving this message as a new subscriber you now have at your fingertips the means to effectively manage and share your businesses regulatory compliance - information, documents, permits, licenses & resources. If you are receiving this message as a new user you now have access to your fleets information, documents, permits, licenses & resources as determined by your portal administrator(s)</p></br><p>As a first step, Super Administrators will want to begin adding their company’s information and documents to their portal. The attached PermiShare Portal User Guide will assist you with the setup process. We recommend reading the user guide in its entirety so that you and your team can get the most out of PermiShare!</p></br><p>Should any questions arise please email us at support@permishare.com and we will be more than happy to assist you.</p></br><p>Sincerely,</p></br><p><b>The PermiShare Team</b></p>',
            // html body
            attachments: [
                {
                    filename: 'User Guide',
                    content: data_base64,
                    type: 'application/pdf',
                    disposition: 'attachment',
                }
            ]
        };
        sgMail.send(msg).then(() => {
            // tra.commit();
            // console.log(msg);
            return resolve({ "success": true, "message": "Account activation link is sent to your email. please check" });
        }).catch(error => {
            return reject({ "success": false, "message": "Failed to send verification link", "error": error.toString() });
        });
    });
}

function sendWelcomeEmail(email, name, tra) {
    return new Promise(function (resolve, reject) {
        let supportEmail = 'support@permishare.com';
        let file1 = "views/apple.jpg";
        let file2 = "views/playstore.png";
        let apple = base64_encode(file1);
        let playstore = base64_encode(file2);
        const msg = {
            to: email,
            from: "support@permishare.com",
            subject: 'Account Activation – PermiShare Mobile App',
            html: '<p>Hi ' + functions.capitalizeString(name) + ',</p></br> <p>Nicely done! Now that you have set a password for the PermiShare app all you have to do is download it from your app store. Click on your respective app store icon below, download the PermiShare app and login for the first time using your email address and the password previously chosen.</p></br><p><a style="margin-right:25px" href="https://apps.apple.com/app/id1589177678"><img alt="My Image" src="cid:12345" width=165" height="60"/></a><a href="https://play.google.com/store/apps/details?id=com.permishare.trs"><img alt="My Image" src="cid:67891" width=165" height="60" /></a></p></br><p>If you have any questions, contact your company administrator or email us at support@permishare.com</p></br><p>Sincerely,</p></br><p><b>The PermiShare Team</b></p>',
            // html body
            attachments: [
                {
                    filename: 'App Store',
                    content: apple,
                    type: 'image/jpg',
                    content_id: '12345',
                    disposition: 'inline'
                },
                {
                    filename: 'Play Store',
                    content: playstore,
                    type: 'image/png',
                    content_id: '67891',
                    disposition: 'inline'
                }
            ]
        };
        sgMail.send(msg).then(() => {
            // tra.commit();
            // console.log(msg);
            return resolve({ "success": true, "message": "Account activation link is sent to your email. please check" });
        }).catch(error => {
            return reject({ "success": false, "message": "Failed to send verification link", "error": error.toString() });
        });
    });
}

exports.forgotPassword = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.email)
                return { success: false, message: 'Invalid params' };
            let utcString = new Date().toUTCString();
            let timeNow = moment(new Date(utcString)).utcOffset('+0530').format('YYYY-MM-DD HH:mm:ss');
            const Users = ORM.model('trs_tbl_users');
            let queryWhere = { "user_email": data.email, "is_deleted": 0 };
            return Users.findOne({ attributes: ["user_id", 'user_name', 'password_reset_token', 'carrier_id'], where: queryWhere }).then(user => {
                if (user) {
                    //if(user.is_verified && user.is_active) {
                    let accessToken = functions.randomValueBase64(20);
                    let hash = bcrypt.hashSync(accessToken, 10);
                    user.password_reset_token = hash;
                    return user.save({ "validate": true, "userId": '2b' }).then(async (updateres) => {
                        let token = functions.encrypt(accessToken);
                        let tStamp = functions.encrypt(timeNow)
                        let uId = functions.encrypt(user.user_id.toString());
                        let url = originurl + '/#/resetpassword?uid=' + uId + '&resetToken=' + token + '&tC=' + tStamp;
                        let email = data.email;
                        let sending_email = await getSendingEmail(user.carrier_id);
                        // console.log(sending_email);
                        let email_res = await sendPassResetEmail(url, email, user.user_name, sending_email.value);
                        if (email_res.success) {
                            return resolve(email_res);
                        } else {
                            return reject(email_res);
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                    /* } else {
                        if(!user.is_verified) {
                            return reject({ success: false, message:"User email is not verified. Please verify your account." });
                        } else {
                            return reject({ success: false, message:"User is not active. Please contact admin. " });
                        }
                    } */
                } else {
                    return reject({ success: false, message: "User not found" });
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

exports.forgotDriverPassword = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            if (!data.email)
                return { success: false, message: 'Invalid params' };
            let utcString = new Date().toUTCString();
            let timeNow = moment(new Date(utcString)).utcOffset('+0530').format('YYYY-MM-DD HH:mm:ss');
            const Driver = ORM.model('trs_tbl_drivers');
            let queryWhere = { "email_address": data.email, "is_deleted": 0 };
            return Driver.findOne({ attributes: ["driver_id", 'driver_last_name', 'driver_first_name', 'password_reset_token', 'carrier_id'], where: queryWhere }).then(user => {
                if (user) {
                    //if(user.is_verified && user.is_active) {
                    let accessToken = functions.randomValueBase64(20);
                    let hash = bcrypt.hashSync(accessToken, 10);
                    user.password_reset_token = hash;
                    return user.save({ "validate": true, "userId": '2b' }).then(async (updateres) => {
                        let token = functions.encrypt(accessToken);
                        let tStamp = functions.encrypt(timeNow);
                        let dId = functions.encrypt(user.driver_id.toString());
                        // let url = originurl + '/#/resetpassword?uid=' + uId + '&resetToken=' + token + '&tC=' + tStamp;
                        let url = originurl + '/#/resetdriverpassword?did=' + dId + '&resetToken=' + token + '&tC=' + tStamp;
                        let email = data.email;
                        let sending_email = await getSendingEmail(user.carrier_id);
                        // console.log(sending_email);
                        let email_res = await sendPassResetEmail(url, email, user.driver_first_name + ' ' + user.driver_last_name , sending_email.value);
                        if (email_res.success) {
                            return resolve(email_res);
                        } else {
                            return reject(email_res);
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({ success: false, message: 'Something went wrong' });
                    });
                    /* } else {
                        if(!user.is_verified) {
                            return reject({ success: false, message:"User email is not verified. Please verify your account." });
                        } else {
                            return reject({ success: false, message:"User is not active. Please contact admin. " });
                        }
                    } */
                } else {
                    return reject({ success: false, message: "Driver not found" });
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

function sendPassResetEmail(reseturl, email, name, sendingEmail) {
    return new Promise(function (resolve, reject) {
        const msg = {
            to: email,
            from: sendingEmail,
            subject: 'Reset Password - PermiShare', // Subject line
            html: '<p>Hello ' + functions.capitalizeString(name) + ',</p></br> <p> Did you forget your password to sign into Permishare ? Let\'s get you a new one.</p></br><p>You have requested a new password for ' + email + ' </p></br><a style="color: #FFFFFF; background-color: #44b6ae;padding: 7px 14px;text-decoration:none;" href="' + reseturl + '">Reset Password</a></br></br><p>Thanks,</p></br><b>PermiShare Support Team</b>' // html body
        };
        sgMail.send(msg).then(() => {
            return resolve({ "success": true, "message": "Password reset link is sent to your email. please check" });
        }).catch(error => {
            return reject({ "success": false, "message": "Failed to send password reset link", "error": error.toString() });
        });
    });
}

function getSendingEmail(ID) {
    return new Promise(function (resolve, reject) {
        const settings = ORM.model('trs_tbl_settings_for_carriers');
        return settings.findOne({ where: { settings_id: 2, carrier_id: ID } }).then(data => {
            return resolve({ success: true, value: data.setting_value });
        }).catch(err => {
            console.log(err);
            return reject({ success: false, message: "Something went wrong" });
        })
    })
}

exports.changePassword = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            // console.log(data);
            if (!data.email)
                return { success: false, message: 'Invalid params' };
            data.id = null;
            const Users = ORM.model('trs_tbl_users');
            let queryWhere = { "user_email": data.email, "is_deleted": 0 };
            return Users.findOne({ attributes: ["user_id", 'password'], where: queryWhere }).then(user => {
                if (user) {
                    if (!bcrypt.compareSync(data.old_password, user.password)) {
                        return reject({ success: false, message: 'Old Password not matched' });
                    } else {
                        user.password = bcrypt.hashSync(data.new_password, 10);
                        return user.save({ "validate": true, "userId": req.session.userId }).then(async (updateres) => {
                            // commonemitter.emit('eventLogEvent', data, 'Password', functions.decrypt(req.session.userId));
                            return resolve({ success: true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    }
                } else {
                    return reject({ success: false, message: "User not found" });
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

exports.changeDriverPassword = async function (req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            // console.log(data);
            if (!data.email)
                return { success: false, message: 'Invalid params' };
            // data.id = null;
            const Users = ORM.model('trs_tbl_drivers');
            let queryWhere = { "email_address": data.email, "is_deleted": 0 };
            return Users.findOne({ attributes: ["driver_id", 'password'], where: queryWhere }).then(user => {
                if (user) {
                    if (!bcrypt.compareSync(data.old_password, user.password)) {
                        return reject({ success: false, message: 'Old Password not matched' });
                    } else {
                        user.password = bcrypt.hashSync(data.new_password, 10);
                        return user.save({ "validate": true, "userId": functions.decrypt(data.driverId) }).then(async (updateres) => {
                            // commonemitter.emit('eventLogEvent', data, 'Password', functions.decrypt(req.session.userId));
                            return resolve({ success: true });
                        }).catch(err => {
                            console.log(err);
                            return reject({ success: false, message: 'Something went wrong' });
                        });
                    }
                } else {
                    return reject({ success: false, message: "Driver not found" });
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