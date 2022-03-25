
const adminSettingServices = require('../services/adminsettings/adminsettingservices');

exports.routes = function(app){
    app.post('/admingetsettings',adminSettingServices.getSettings);
    app.put('/adminupdatesettings',adminSettingServices.updateSettings);
}
