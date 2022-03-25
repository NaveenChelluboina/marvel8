const carriercorporateinfoServices = require('../services/carriercorporateinfo/carriercorporateinfoservices');

exports.routes = function(app) {
    app.post('/getstatesdropdown',carriercorporateinfoServices.getStatesDropdown);
    app.post('/driverlogin', carriercorporateinfoServices.authenticateDriver);
    app.post('/addcorpinfo',carriercorporateinfoServices.addCorpInfo);
    app.post('/adddriver',carriercorporateinfoServices.addDriver);
    app.post('/getdrivers',carriercorporateinfoServices.getDrivers);
    app.post('/updatedriver',carriercorporateinfoServices.updateDriver);
    app.post('/updatedrivercomments',carriercorporateinfoServices.updateDriverComments);
    app.post('/addnewdriverdocx',carriercorporateinfoServices.addNewDriverDocument);
    app.post('/getcorporateinfo',carriercorporateinfoServices.getCorporateInfo);
    app.put('/updatecorporateinfo',carriercorporateinfoServices.updateCorporateInformation);
    app.post('/updatedriverdocuments',carriercorporateinfoServices.updateDriverDocuments);
    app.post('/getalldrivers',carriercorporateinfoServices.getAllDrivers);
    app.post('/deletecoroperatedoc',carriercorporateinfoServices.deleteCoroperateDoc)
    app.post('/addbulkdrivers',carriercorporateinfoServices.addBulkDrivers);
    app.post('/addnewdriverdocuments',carriercorporateinfoServices.addNewDriverDocuments);
    app.post('/getstatesforcanadaandusa',carriercorporateinfoServices.getStatesForCanadaAndUsa);
    app.post('/updatecorporatedocumentinfo',carriercorporateinfoServices.updateCorporateCocumentInfo);
    app.put('/updategridcolumnsindriver',carriercorporateinfoServices.updateGridColumns);
    app.post('/getgridcolumnsindriver',carriercorporateinfoServices.getGridColumns);
    app.post('/updatemyactiveassetinmobile',carriercorporateinfoServices.makeAssetActiveInMobileApp);
    app.post('/getdrivercurrentassetid',carriercorporateinfoServices.getDriverCurrentAssetId);
    app.post('/unselectactiveassetinmobile',carriercorporateinfoServices.makeAssetInActiveAsUnselectInMobileApp);
    app.put('/senddriverpasswordlink',carriercorporateinfoServices.sendDriverPasswordLink);
    app.post('/getcorpdocsformobile',carriercorporateinfoServices.getCorporateDocsForMobile);
    app.post('/logoutdriver',carriercorporateinfoServices.logoutDriver);
    app.post('/getdriverdocxformobile',carriercorporateinfoServices.getDriverDocxForMobileApp);
    app.post('/getappnotifications',carriercorporateinfoServices.getAppNotifications);
}