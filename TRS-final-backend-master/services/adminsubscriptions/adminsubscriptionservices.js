const subscriptionsdao = require('../../orm/daos/adminsubscriptions/adminsubscriptiondao');
const functions = require('../../lib/functions');

exports.getSubscriptions = async function(req,res) {
    try {
        subscriptionsdao.getSubscriptions(req).then(data => {
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

exports.getClients = async function(req,res) {
    try {
        subscriptionsdao.getClients(req).then(data => {
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

exports.getSubscriptionsFromDashboard = async function(req,res) {
    try {
        subscriptionsdao.getSubscriptionsFromDashboard(req).then(data => {
            return data;
        }).catch(error => {
            console.log(error);
            return error;
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.getingleSubscriptions = async function(req,res) {
    try {
        subscriptionsdao.getingleSubscriptions(req).then(data => {
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

exports.getUpgradingPackages = async function(req,res) {
    try {
        subscriptionsdao.getUpgradingPackages(req).then(data => {
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

exports.upgradePackageAndPlanForSubscriber = async function(req,res) {
    try {
        subscriptionsdao.upgradePackageAndPlanForSubscriber(req).then(data => {
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

exports.unsubscribeAPackage = async function(req,res) {
    try {
        subscriptionsdao.unsubscribeAPackage(req).then(data => {
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

exports.updateACarrierFromStripe = async function(req,res) {
    try {
        subscriptionsdao.updateACarrierFromStripe(req).then(data => {
            return data;
        }).catch(error => {
            console.log(error);
            return error;
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).send({"message":"Failed to process request"});
    }
}

exports.addANewCarrierFromAdmin = async function(req,res) {
    try {
        subscriptionsdao.addANewCarrierFromAdmin(req).then(data => {
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

exports.updateCarrierFromAdmin = async function(req,res) {
    try {
        subscriptionsdao.updateCarrierFromAdmin(req).then(data => {
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

exports.convertClientIntoSubscriber = async function(req,res) {
    try {
        subscriptionsdao.convertClientIntoSubscriber(req).then(data => {
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

exports.checkUrlStatusForCarrier = async function(req, res) {
    try {
        subscriptionsdao.checkUrlStatusForCarrier(req).then(data => {
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

exports.getSingleClient = async function(req,res) {
    try {
        subscriptionsdao.getSingleClient(req).then(data => {
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
