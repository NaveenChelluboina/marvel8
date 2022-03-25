const adminServices = require('../services/carrieradmin/carrieradminservices');

exports.routes = function(app){
    app.use(function timeLog(req, res, next) {
        try {
            let skipUrls = {"/":true,"/login":true,"/driverlogin":true,"/activatedriver":true,"/checksession":true,"/logout":true,"/checkdriverurlstatus":true,"/checkurlstatus":true,"/activateuser":true,"/resetpassword":true,"/forgotpassword":true,"/forgotdriverpassword":true,"/checkresetpassurlstatus":true,"/getpackageamount":true,"/makepayment":true,"/getstatesdropdown":true,"/checkurlstatusofcarrier":true,"/resetdriverpassword":true,"/checkresetpassdriverurlstatus":true};
            if (skipUrls[req.url]) return next();
            let bearerHeader = req.headers["authorization"];
            let bearer = bearerHeader.split(" ");
            let bearerToken = bearer[1];
            // next();
            // console.log(req);
            // console.log(req.headers);
            // console.log(req.session.dId);
            // console.log(req.session.from);
            // console.log(bearerToken);
            // console.log(req.session.driverToken);
            if(req.headers.from) {
                next();
            }
            else {
                // if (req.session.token === bearerToken) {
                    next();
                // } else {
                //     console.log("Not here");
                //     res.status(401).send({ success: false, message: 'Failed to authenticate token. 2' });
                // }
            }
            
        } catch(err) {
            res.status(401).send({ success: false, message: 'Failed to authenticate token. 1' });
        }
    });
    app.post('/getRoles',adminServices.getRoles);
    app.post('/addorchangeprofilepic',adminServices.addOrEditProfilePic);
    app.get('/getrolepermissions/:roleId',adminServices.getRolePermissions);
    app.post('/updateuserpermissions',adminServices.updateUserPermissions);
    app.post('/addroles',adminServices.addRoles);
    app.put('/updaterole',adminServices.updateRole);
    app.post('/getassettypes',adminServices.getAssetTypes);
    app.post('/getsssettypedropdown',adminServices.getAssetTypeDropdown);
    app.put('/updateassettypes',adminServices.updateAssetType);
    app.post('/addassettype',adminServices.addAssetType);
    app.post('/getassetmakes',adminServices.getAssetMakes);
    app.post('/getassetmakesdropdown',adminServices.getAssetMakesDropDown);
    app.put('/updateassetmakes',adminServices.updateAssetMake);
    app.post('/addassetmake',adminServices.addAssetMake);
    app.post('/adduser', adminServices.addUser);
    app.post('/getrolesdropdown',adminServices.getRolesDropdown);
    app.post('/getallusers',adminServices.getAllUsers);
    app.put('/updateuser',adminServices.updateUser);
    app.post('/getsettings',adminServices.getSettings);
    app.put('/updatesettings',adminServices.updateSettings);
    app.post('/getselectedstatesdropdown',adminServices.getSelectedStatesDropDown);
    app.post('/driverdocumenthistory',adminServices.addNewRecordInHistory);
    app.post('/getdocssharehistory',adminServices.getDocsShareHistory);
    app.post('/getassethistory',adminServices.getAssetHistory);
    app.post('/getassethistoryformobile',adminServices.getAssetHistoryForMobile);
    app.post('/getdriverdocshistoryformobile',adminServices.getDocsShareHistoryForMobile);
    app.post('/addfirebaseid',adminServices.addFirebaseId);
    app.post('/addorchangeprofilepicios',adminServices.addOrEditProfilePicIos);
};