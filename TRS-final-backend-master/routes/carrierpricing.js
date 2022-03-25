
const carrierpricingServices = require('../services/carrierpricing/carrierpricingservices');

exports.routes = function(app) {
    app.post('/getpricingdata',carrierpricingServices.getPricingData);
    app.post('/getpackageamount',carrierpricingServices.getPackageAmount);
}