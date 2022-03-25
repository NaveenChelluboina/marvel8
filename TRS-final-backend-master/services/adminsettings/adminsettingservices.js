
const adminsettingsdao = require('../../orm/daos/adminsettings/adminsettingdao');
const functions = require('../../lib/functions');

exports.getSettings = async function(req,res) {
    try {
        adminsettingsdao.getSettings(req).then(data => {
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

exports.updateSettings = async function(req,res) {
    try {
        adminsettingsdao.updateSettings(req).then(data => {
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