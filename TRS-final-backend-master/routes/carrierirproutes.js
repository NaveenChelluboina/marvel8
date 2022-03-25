const carrierirpServices = require('../services/carrierirp/carrierirpservices');

exports.routes = function(app) {
    app.post('/addirpweightgroup',carrierirpServices.addIrpWeightGrop);
    app.post('/addirpdocument',carrierirpServices.addIrpDoc);
    app.post('/addirpyear',carrierirpServices.addIrpYear);
    app.post('/getirpyeardropdown',carrierirpServices.getIrpYearDropDown);
    app.post('/getirp',carrierirpServices.getIrp)
    app.post('/deleterecord',carrierirpServices.deleteRecord);
}