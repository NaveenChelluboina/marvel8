const carrierirpdao = require('../../orm/daos/carrierirp/carrierirpdao');


exports.addIrpWeightGrop = async function(req,res) {
    try {
        carrierirpdao.addIrpWeightGrop(req).then(data => {
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

exports.addIrpDoc = async function(req,res) {
    try {
        carrierirpdao.addIrpDoc(req).then(data => {
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

exports.addIrpYear = async function(req,res) {
    try {
        carrierirpdao.addIrpYear(req).then(data => {
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
exports.getIrpYearDropDown = async function(req,res) {
    try {
        carrierirpdao.getIrpYearDropDown(req).then(data => {
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
exports.getIrp = async function(req,res) {
    try {
        carrierirpdao.getIrp(req).then(data => {
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
exports.deleteRecord = async function(req,res) {
    try {
        carrierirpdao.deleteRecord(req).then(data => {
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