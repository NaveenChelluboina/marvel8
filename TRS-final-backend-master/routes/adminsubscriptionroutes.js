const adminSubscriptionServices = require('../services/adminsubscriptions/adminsubscriptionservices');

exports.routes = function(app) {
    app.post('/getsubscriptions',adminSubscriptionServices.getSubscriptions);
    app.post('/getclients',adminSubscriptionServices.getClients);
    app.post('/getsinglesubscription',adminSubscriptionServices.getingleSubscriptions);
    app.post('/getupgradingpackages',adminSubscriptionServices.getUpgradingPackages);
    app.post('/upgradeaplan',adminSubscriptionServices.upgradePackageAndPlanForSubscriber);
    app.post('/unsubscribepackage',adminSubscriptionServices.unsubscribeAPackage);
    app.post('/addacarrierfromadmin',adminSubscriptionServices.addANewCarrierFromAdmin);
    app.put('/updateclientinadmin',adminSubscriptionServices.updateCarrierFromAdmin);
    app.put('/convertclientintosub',adminSubscriptionServices.convertClientIntoSubscriber);
    app.post('/checkurlstatusofcarrier', adminSubscriptionServices.checkUrlStatusForCarrier);
    app.post('/getsingleclientdet',adminSubscriptionServices.getSingleClient);
}