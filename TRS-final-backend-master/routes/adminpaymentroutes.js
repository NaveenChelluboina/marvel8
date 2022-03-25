const adminPaymentServices = require('../services/adminpayments/adminpaymentservices');

exports.routes = function(app) {
    app.post('/makepayment',adminPaymentServices.makePayment);
    app.post('/makepaymentforpackageforclient',adminPaymentServices.makeNewPaymentForAClient);
    app.post('/updategridcolumnsforclientsscreen',adminPaymentServices.updateGridColumnsForClientsScreen);
    app.post('/getgridcolumnsforclientsscreen',adminPaymentServices.getGridColumnsForClientsScreen);
}