 const carrierHomeServices = require('../services/carrierhome/carrierhomeservices');
 exports.routes = function(app) {
    app.post('/getcorporateinfoinhome',carrierHomeServices.getCorpInfo);
    app.post('/getdriverdocsinhome',carrierHomeServices.getDriverDocuments);
    app.put('/updatealertstatus',carrierHomeServices.updateAlertStatus);
 }