const authdao = require('../../orm/daos/carrierauth/carrierauthdao');
const functions = require('../../lib/functions');
var moment = require('moment');
// const commonemitter = require('../../lib/custom-events').commonEmitter;

exports.authenticate = async function(req, res) {
    try {
        authdao.authenticate(req).then(data => {
            res.json(data);
        }).catch(error => {
            // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at authenticate : '+error.message});
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": error.stack});
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.checkSession = async function(req, res) {
    try {
        let bearerHeader = req.headers["authorization"];
        let bearer = bearerHeader.split(" ");
        let bearerToken = bearer[1];
        // if (req.session.token === bearerToken) {
            res.json({ "success": true });
        // } else {
        //     res.status(401).send({ success: false, message: 'Failed to authenticate token. 3' });
        // }
    } catch(error) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": error.stack});
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}   

exports.checkUrlStatus = async function(req, res) {
    try {
        authdao.checkUrlStatus(req).then(data => {
            res.json(data);
        }).catch(error => {
            // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at checkUrlStatus : '+error.message});
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": error.stack});
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.checkDriverUrlStatus = async function(req, res) {
    try {
        authdao.checkDriverUrlStatus(req).then(data => {
            res.json(data);
        }).catch(error => {
            // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at checkUrlStatus : '+error.message});
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": error.stack});
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.activateUser = function (req, res) {
    try {
        var require = ['userId', 'password', 'accessToken'];
        var integer = '';
        var report = functions.validation(req.body, require, integer);
        if (!report.status) {
            res.json(report);
        } else {
            authdao.activateUser(req).then(data => {
                res.json(data);
            }).catch(error => {
                // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at activateUser : '+error.message});
                console.log(error);
                res.json(error);
            });
        }
    } catch (e) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.activateDriver = function (req, res) {
    try {
        var require = ['driverId', 'password', 'accessToken'];
        var integer = '';
        var report = functions.validation(req.body, require, integer);
        if (!report.status) {
            res.json(report);
        } else {
            authdao.activateDriver(req).then(data => {
                res.json(data);
            }).catch(error => {
                // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at activateUser : '+error.message});
                console.log(error);
                res.json(error);
            });
        }
    } catch (e) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.forgotPassword = function (req, res) {
    try {
        var require = ['email'];
        var integer = '';
        var report = functions.emailvalidation(req.body, require, integer);
        if (!report.status) {
            res.json(report);
        } else {
            authdao.forgotPassword(req).then(data => {
                res.json(data);
            }).catch(error => {
                // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at forgotPassword : '+error.message});
                console.log(error);
                res.json(error);
            });
        }
    } catch (e) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.forgotDriverPassword = function (req, res) {
    try {
        var require = ['email'];
        var integer = '';
        var report = functions.emailvalidation(req.body, require, integer);
        if (!report.status) {
            res.json(report);
        } else {
            authdao.forgotDriverPassword(req).then(data => {
                res.json(data);
            }).catch(error => {
                // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at forgotPassword : '+error.message});
                console.log(error);
                res.json(error);
            });
        }
    } catch (e) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.checkPasswordResetUrl = function (req, res) {
    try {
        if (req.body.timeStamp) {
            var utcString = new Date().toUTCString();
            var timeNow = moment(new Date(utcString)).utcOffset('+0530').format('YYYY-MM-DD HH:mm:ss');
            var timeStamp = req.body.timeStamp;
            timeStamp = functions.decrypt(timeStamp);
            timeStamp = moment(new Date(timeNow)).diff(timeStamp);
            if (Number(timeStamp) < 86400000) {
                authdao.checkUrlStatus(req).then(data => {
                    res.json(data);
                }).catch(error => {
                    // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at forgotPassword : '+error.message});
                    console.log(error);
                    res.json(error);
                });
            } else {
                res.json({ success: false, message: 'url expired' });
            }
        } else {
            res.json({ length: 0, message: 'Invalid url' });
        }
    } catch (e) {
        commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.checkPasswordResetDriverUrl = function (req, res) {
    try {
        if (req.body.timeStamp) {
            var utcString = new Date().toUTCString();
            var timeNow = moment(new Date(utcString)).utcOffset('+0530').format('YYYY-MM-DD HH:mm:ss');
            var timeStamp = req.body.timeStamp;
            timeStamp = functions.decrypt(timeStamp);
            timeStamp = moment(new Date(timeNow)).diff(timeStamp);
            if (Number(timeStamp) < 86400000) {
                authdao.checkDriverUrlStatus(req).then(data => {
                    res.json(data);
                }).catch(error => {
                    // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at forgotPassword : '+error.message});
                    console.log(error);
                    res.json(error);
                });
            } else {
                res.json({ success: false, message: 'url expired' });
            }
        } else {
            res.json({ length: 0, message: 'Invalid url' });
        }
    } catch (e) {
        commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.resetPassword = function (req, res) {
    try {
        var require = ['userId', 'password', 'accessToken'];
        var integer = '';
        var report = functions.validation(req.body, require, integer);
        if (!report.status) {
            res.json(report);
        } else {
            authdao.activateUser(req).then(data => {
                res.json(data);
            }).catch(error => {
                // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at forgotPassword : '+error.message});
                console.log(error);
                res.json(error);
            });
        }
    } catch (e) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.resetDriverPassword = function (req, res) {
    try {
        var require = ['driverId', 'password', 'accessToken'];
        var integer = '';
        var report = functions.validation(req.body, require, integer);
        if (!report.status) {
            res.json(report);
        } else {
            authdao.activateDriver(req).then(data => {
                res.json(data);
            }).catch(error => {
                // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": 'Error at forgotPassword : '+error.message});
                console.log(error);
                res.json(error);
            });
        }
    } catch (e) {
        // commonemitter.emit('errorLogEvent', {"created_by":1, "error_msg": e.stack});
        console.log(e);
        res.status(421).send({ message: 'Failed to process request' });
    }
}

exports.changePassword = async function(req, res) {
    try {
        authdao.changePassword(req).then(data => {
            res.json(data);
        }).catch(error => {
            // commonemitter.emit('errorLogEvent', {"created_by": functions.decrypt(req.session.userId), "error_msg": 'Error at changePassword : '+error.message});
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        // commonemitter.emit('errorLogEvent', {"created_by": functions.decrypt(req.session.userId), "error_msg": error.stack});
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.changeDriverPassword = async function(req, res) {
    try {
        authdao.changeDriverPassword(req).then(data => {
            res.json(data);
        }).catch(error => {
            // commonemitter.emit('errorLogEvent', {"created_by": functions.decrypt(req.session.userId), "error_msg": 'Error at changePassword : '+error.message});
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        // commonemitter.emit('errorLogEvent', {"created_by": functions.decrypt(req.session.userId), "error_msg": error.stack});
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}