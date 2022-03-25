const adminPaymentsdao = require('../../orm/daos/adminpayments/adminpaymentdao');

exports.makePayment = function(req,res) {
    try {
        adminPaymentsdao.makePayment(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"})
    }
}

exports.makeNewPaymentForAClient = function(req,res) {
    try {
        adminPaymentsdao.makeNewPaymentForAClient(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"})
    }
}

exports.updateGridColumnsForClientsScreen = function(req,res) {
    try {
        adminPaymentsdao.updateGridColumnsForClientsScreen(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"})
    }
}

exports.getGridColumnsForClientsScreen = function(req,res) {
    try {
        adminPaymentsdao.getGridColumnsForClientsScreen(req).then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.json(err);
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"})
    }
}