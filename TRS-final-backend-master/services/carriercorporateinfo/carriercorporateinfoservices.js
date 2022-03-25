const carriercorpdao = require('../../orm/daos/carriercorporateinfo/carriercorporateinfodao');
const functions = require('../../lib/functions');

exports.getStatesDropdown = async function(req,res) {
    try {
        carriercorpdao.getStatesDropdown(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.addCorpInfo = async function(req,res) {
    try {
        carriercorpdao.addCorpInfo(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.updateCorporateCocumentInfo = async function(req,res) {
    try {
        carriercorpdao.updateCorporateCocumentInfo(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.addDriver = async function(req,res) {
    try {
        carriercorpdao.addDriver(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getDrivers = async function(req,res) {
    try {
        carriercorpdao.getDrivers(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.updateDriver = async function(req,res) {
    try {
        carriercorpdao.updateDriver(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.updateDriverComments = async function(req,res) {
    try {
        carriercorpdao.updateDriverComments(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.sendDriverPasswordLink = async function(req,res) {
    try {
        carriercorpdao.sendDriverPasswordLink(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.addNewDriverDocument = async function(req,res) {
    try {
        carriercorpdao.addNewDriverDocument(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}
exports.addNewDriverDocuments = async function(req,res) {
    try {
        carriercorpdao.addNewDriverDocuments(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getCorporateInfo = async function(req,res) {
    try {
        carriercorpdao.getCorporateInfo(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.updateCorporateInformation = async function(req,res) {
    try {
        carriercorpdao.updateCorporateInformation(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}
exports.updateDriverDocuments = async function(req,res) {
    try {
        carriercorpdao.updateDriverDocuments(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getAllDrivers = async function(req,res) {
    try {
        carriercorpdao.getAllDrivers(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.deleteCoroperateDoc = async function(req,res) {
    try {
        carriercorpdao.deleteCoroperateDoc(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}
exports.addBulkDrivers = async function(req,res) {
    try {
        carriercorpdao.addBulkDrivers(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getStatesForCanadaAndUsa = async function(req,res) {
    try {
        carriercorpdao.getStatesForCanadaAndUsa(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.checkExpiryDateOfDriver = async function(req, res) {
    try {
        carriercorpdao.checkExpiryDateOfDriver(req).then(data => {
            return data;
        }).catch(error => {
            console.log(error);
            return error;
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.updateGridColumns = async function(req, res) {
    try {
        carriercorpdao.updateGridColumns(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getGridColumns = async function(req, res) {
    try {
        carriercorpdao.getGridColumns(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.authenticateDriver = async function(req, res) {
    try {
        carriercorpdao.authenticateDriver(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.makeAssetActiveInMobileApp = async function(req, res) {
    try {
        carriercorpdao.makeAssetActiveInMobileApp(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getDriverCurrentAssetId = async function(req, res) {
    try {
        carriercorpdao.getDriverCurrentAssetId(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.makeAssetInActiveAsUnselectInMobileApp = async function(req, res) {
    try {
        carriercorpdao.makeAssetInActiveAsUnselectInMobileApp(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getCorporateDocsForMobile = async function(req, res) {
    try {
        carriercorpdao.getCorporateDocsForMobile(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.logoutDriver = async function(req, res) {
    try {
        carriercorpdao.logoutDriver(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getDriverDocxForMobileApp = async function(req, res) {
    try {
        carriercorpdao.getDriverDocxForMobileApp(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getAppNotifications = async function(req, res) {
    try {
        carriercorpdao.getAppNotifications(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}