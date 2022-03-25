
const carrierfleetdao = require('../../orm/daos/carrierfleet/carrierfleetdao');
const functions = require('../../lib/functions');


exports.addFleet = async function(req,res) {
    try {
        carrierfleetdao.addFleet(req).then(data => {
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

exports.getFleet = async function(req,res) {
    try {
        carrierfleetdao.getFleet(req).then(data => {
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

exports.updateFleet = async function(req,res) {
    try {
        carrierfleetdao.updateFleet(req).then(data => {
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
exports.getFleetDropDown = async function(req,res) {
    try {
        carrierfleetdao.getFleetDropDown(req).then(data => {
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
