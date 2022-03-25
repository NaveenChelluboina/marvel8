
const carrierpricing = require('../../orm/daos/carrierpricing/carrierpricingdao');

exports.getPricingData = async function(req,res) {
    try {
        carrierpricing.getPricingData(req).then(data => {
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

exports.getPackageAmount = async function(req,res) {
    try {
        carrierpricing.getPackageAmount(req).then(data => {
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