const authServices = require('../services/carrierauth/carrierauthservices');
const adminServices = require('../services/carrieradmin/carrieradminservices');
exports.routes = function(app){
    app.post('/login', authServices.authenticate);
    app.get('/checksession', authServices.checkSession);
    app.post('/checkurlstatus', authServices.checkUrlStatus);
    app.post('/checkdriverurlstatus',authServices.checkDriverUrlStatus);
    app.post('/activatedriver',authServices.activateDriver)
    app.post('/checkresetpassurlstatus', authServices.checkPasswordResetUrl);
    app.post('/checkresetpassdriverurlstatus', authServices.checkPasswordResetDriverUrl);
    app.post('/activateuser', authServices.activateUser);
    app.post('/forgotpassword', authServices.forgotPassword);
    app.post('/forgotdriverpassword', authServices.forgotDriverPassword)
    app.post('/resetpassword', authServices.resetPassword);
    app.post('/resetdriverpassword', authServices.resetDriverPassword);
    app.put('/changepassword', authServices.changePassword);
    app.put('/changedriverpassword', authServices.changeDriverPassword);
    app.post('/logout', function (req, res) {
        try {
            if (req.session) {
                req.session.destroy();
            }
            res.json({ success: true, message: 'Logged out successfully' });
            
        } catch (e) {
            res.status(421).send({ message: 'Failed to process request' });
        }
    });
};