const carrierfleetServices = require('../services/carrierfleet/carrierfleetservices');

exports.routes = function(app) {
    app.post('/addfleet',carrierfleetServices.addFleet);
    app.post('/getfleet',carrierfleetServices.getFleet);
    app.post('/updatefleet',carrierfleetServices.updateFleet);
    app.post('/getfleetdropdown',carrierfleetServices.getFleetDropDown)
}