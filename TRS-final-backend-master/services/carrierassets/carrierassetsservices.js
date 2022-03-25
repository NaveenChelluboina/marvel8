const carrierassetsdao = require('../../orm/daos/carrierassets/carrierassetsdao');


exports.addAssets = async function(req,res) {
    try {
        carrierassetsdao.addAssets(req).then(data => {
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
exports.getAssets = async function(req,res) {
    try {
        carrierassetsdao.getAssets(req).then(data => {
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
exports.addNewAssetDocument = async function(req,res) {
    try {
        carrierassetsdao.addNewAssetsDocument(req).then(data => {
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

exports.updateAssets = async function(req,res) {
    try {
        carrierassetsdao.updateAssets(req).then(data => {
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

exports.updateDocuments = async function(req,res) {
    try {
        carrierassetsdao.updateDocuments(req).then(data => {
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

exports.updateAssetComments = async function(req,res) {
    try {
        carrierassetsdao.updateAssetsComments(req).then(data => {
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

exports.getAllAssets = async function(req,res) {
    try {
        carrierassetsdao.getAllAssets(req).then(data => {
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

exports.checkExpiryDateOfAsset = async function(req, res) {
    try {
        carrierassetsdao.checkExpiryDateOfAsset(req).then(data => {
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

exports.getAllAssetTypes = async function(req, res) {
    try {
        carrierassetsdao.getAllAssetTypes(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAllAssetMakes = async function(req, res) {
    try {
        carrierassetsdao.getAllAssetMakes(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}

exports.getAllFleets = async function(req, res) {
    try {
        carrierassetsdao.getAllFleets(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ "message": "Failed to process request" });
    }
}
exports.addBulkAssets = async function(req,res) {
    try {
        carrierassetsdao.addBulkAssets(req).then(data => {
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
exports.getassetsdropdown = async function(req,res) {
    try {
        carrierassetsdao.getAllAssetDropDown(req).then(data => {
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

exports.updateGridColumns = async function(req, res) {
    try {
        carrierassetsdao.updateGridColumns(req).then(data => {
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
        carrierassetsdao.getGridColumns(req).then(data => {
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

exports.deleteAsset = async function(req, res) {
    try {
        carrierassetsdao.deleteAsset(req).then(data => {
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

exports.getMaxSize = async function(req, res) {
    try {
        carrierassetsdao.getMaxSize(req).then(data => {
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

exports.getAssetsAndDocxForMobile = async function(req, res) {
    try {
        carrierassetsdao.getAssetsAndDocxForMobile(req).then(data => {
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