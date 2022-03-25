const admindashboarddao = require('../../orm/daos/admindashboard/admindashboarddao');


exports.dashboardData = function(req,res) {
    try {
        admindashboarddao.dashboardData(req).then(data => {
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

exports.dashboardSubricibersData = function(req,res) {
    try {
        admindashboarddao.dashboardSubricibersData(req).then(data => {
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

exports.dashboardFleetsData = function(req,res) {
    try {
        admindashboarddao.dashboardFleetsData(req).then(data => {
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
exports.dashboardLineChartData = function(req,res) {
    try {
        admindashboarddao.dashboardLineChartData(req).then(data => {
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