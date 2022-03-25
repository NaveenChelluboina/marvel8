const carrieriftaServices = require('../services/carrierifta/carrieriftaservices');

exports.routes = function(app) {
    app.post('/addiftayear',carrieriftaServices.addIftaYear);
    app.post('/updateiftayear',carrieriftaServices.updateIftaYear);
    app.post('/updateiftayeardoc',carrieriftaServices.updateIftaYearDoc)
    app.post('/deleteiftayeardoc',carrieriftaServices.deleteiftayeardoc);
    app.post('/addiftaassets',carrieriftaServices.addIftaAssets);
    app.post('/getiftaassets',carrieriftaServices.getIftaAssets);
    app.post('/getalliftaassets',carrieriftaServices.getAllIftaAssets);
    app.post('/updateiftaassets',carrieriftaServices.updateIftaAssets);
    app.post('/getiftayear',carrieriftaServices.getIftaYear);
    app.post('/addbulkiftaassets',carrieriftaServices.addBulkIftaAssets);
}