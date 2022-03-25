const admindao = require('../../orm/daos/carrieradmin/carrieradmindao');
const functions = require('../../lib/functions');

exports.getRoles = async function (req, res) {
    try {
        admindao.getRoles(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getRolePermissions = async function (req, res) {
    try {
        admindao.getRolePermissions(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "message": "Failed to process reques" });
    }
}

exports.updateUserPermissions = async function (req, res) {
    try {
        admindao.updateUserPermissions(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addRoles = async function (req, res) {
    try {
        admindao.addRoles(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.updateRole = async function (req, res) {
    try {
        admindao.updateRole(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAssetTypes = async function (req, res) {
    try {
        admindao.getAssetTypes(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAssetTypeDropdown = async function (req, res) {
    try {
        admindao.getAssetTypeDropdown(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addOrEditProfilePic = async function (req, res) {
    try {
        admindao.addOrEditProfilePic(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addNewRecordInHistory = async function (req, res) {
    try {
        admindao.addNewRecordInHistory(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.updateAssetType = async function (req, res) {
    try {
        admindao.updateAssetType(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addAssetType = async function (req, res) {
    try {
        admindao.addAssetType(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAssetMakes = async function (req, res) {
    try {
        admindao.getAssetMakes(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}
exports.getAssetMakesDropDown = async function (req, res) {
    try {
        admindao.getAssetMakesDropDown(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}
exports.updateAssetMake = async function (req, res) {
    try {
        admindao.updateAssetMake(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addAssetMake = async function (req, res) {
    try {
        admindao.addAssetMake(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addUser = async function (req, res) {
    try {
        // let require = ['user_name', 'phone', 'user_email'];
        // let integer = ['role_id'];
        // let report = functions.validation(req.body,require, integer);
        // if(!report.status)
        //     res.json(report);
        admindao.addNewUser(req).then(data => {
            res.json(data);
        }).catch(error => {
            // commonemitter.emit('errorLogEvent', {"created_by": functions.decrypt(req.session.userId), "error_msg": 'Error at addUser : '+error.message});
            console.log(error);
            res.json(error);
        });
    } catch (error) {
        // commonemitter.emit('errorLogEvent', {"created_by": functions.decrypt(req.session.userId), "error_msg": error.stack});
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getRolesDropdown = async function (req, res) {
    try {
        admindao.getRolesDropdown(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAllUsers = async function (req, res) {
    try {
        admindao.getAllUsers(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.updateUser = async function (req, res) {
    try {
        admindao.updateUser(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getSettings = async function (req, res) {
    try {
        admindao.getSettings(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getSelectedStatesDropDown = async function (req, res) {
    try {
        admindao.getSelectedStatesDropDown(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.updateSettings = async function (req, res) {
    try {
        admindao.updateSettings(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getSending = async function (req, res) {
    try {
        admindao.SendOut(req).then(data => {
            return data;
        }).catch(error => {
            console.log(error);
            return error;
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getDocsShareHistory = async function (req, res) {
    try {
        admindao.getDocsShareHistory(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAssetHistory = async function (req, res) {
    try {
        admindao.getAssetHistory(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAssetHistoryForMobile = async function (req, res) {
    try {
        admindao.getAssetHistoryForMobile(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getDocsShareHistoryForMobile = async function (req, res) {
    try {
        admindao.getDocsShareHistoryForMobile(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addFirebaseId = async function (req, res) {
    try {
        admindao.addFirebaseId(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.addOrEditProfilePicIos = async function (req, res) {
    try {
        admindao.addOrEditProfilePicIos(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

