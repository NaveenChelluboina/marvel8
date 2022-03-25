const carrierassetsServices = require('../services/carrierassets/carrierassetsservices');

exports.routes = function(app) {
    app.post('/addassets',carrierassetsServices.addAssets);
    app.post('/getassets',carrierassetsServices.getAssets);
    app.post('/addnewassets',carrierassetsServices.addNewAssetDocument);
    app.post('/updateassets',carrierassetsServices.updateAssets);
    app.post('/updatedocuments',carrierassetsServices.updateDocuments);
    app.post('/getallassets',carrierassetsServices.getAllAssets);
    app.post('/getallassettypes',carrierassetsServices.getAllAssetTypes);
    app.post('/getallassetmakes',carrierassetsServices.getAllAssetMakes);
    app.post('/getallfleets',carrierassetsServices.getAllFleets);
    app.post('/addbulkassets',carrierassetsServices.addBulkAssets);
    app.post('/getassetsdropdown',carrierassetsServices.getassetsdropdown);
    app.put('/updategridcolumnsinasset',carrierassetsServices.updateGridColumns);
    app.post('/getgridcolumnsinasset',carrierassetsServices.getGridColumns);
    app.put('/deleteasset',carrierassetsServices.deleteAsset);
    app.post('/getmaxassets',carrierassetsServices.getMaxSize);
    app.post('/updateassetcomments',carrierassetsServices.updateAssetComments);
    app.post('/getassetsformobile',carrierassetsServices.getAssetsAndDocxForMobile);
}
