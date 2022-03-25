const carrierhomedao = require('../../orm/daos/carrierhome/carrierhomedao');
const functions = require('../../lib/functions');

exports.getCorpInfo = async function(req,res) {
    try {
        carrierhomedao.getCorpInfo(req).then(data => {
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

exports.getDriverDocuments = async function(req,res) {
    try {
        carrierhomedao.getDriverDocuments(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(e) {
        console.log(e);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.updateAlertStatus = async function(req,res) {
    try {
        carrierhomedao.updateAlertStatus(req).then(data => {
            res.json(data);
        }).catch(error => {
            console.log(error);
            res.json(error);
        })
    }
    catch(e) {
        console.log(e);
        res.status(500).send({"message":"Failed to process request"});
    }
}