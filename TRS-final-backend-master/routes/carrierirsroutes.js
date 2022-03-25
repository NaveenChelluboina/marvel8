const carrierirsServices = require('../services/carrierirs/carrierirsservices');

exports.routes = function(app) {
    app.post('/addyearinirs',carrierirsServices.addYearInIRS);
    app.post('/getallirs',carrierirsServices.getAllIRS);
    app.post('/adddocumentsinirsforassets',carrierirsServices.addIrsDocumentForYear);
    app.post('/getassetswithdocumentsdropdown',carrierirsServices.getAssetsWithDocuments);
    app.post('/updateassetdocumentstatus',carrierirsServices.updateAssetDocumentStatus);
    app.post('/getdocumentsforassetpage',carrierirsServices.getDocumentsForAssetsPage);
    app.put('/updatedocumentinirs',carrierirsServices.updateDocumentInIrs);
    app.put('/deleteyearinirs',carrierirsServices.deleteYearInIrs);
    app.put('/updatecalendarinirs',carrierirsServices.updateCalendarInIrs);
}