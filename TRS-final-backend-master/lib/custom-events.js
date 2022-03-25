// var events = require('events');
// var fs = require('fs');
// var em = new events.EventEmitter();
// var path = require('path');
// var moment = require('moment');
// var Log = require('log');
// var logEv = require('../orm/daos/logs/logsdao');
// var log = new Log('', fs.createWriteStream(path.join(__dirname, '/../logs/app-Log-' + moment().format('DD-MM-YYYY') + '.log'), {flags: 'a'}));

// em.on('eventLogEvent', (data, table, userId) => {
//     if("updateFields" in data) {
//         let id = data.id;
//         data = data['updateFields'];
//         data['id'] = id;
//     }
//     let obj = {"event_name": "", "event_type": "", "event_description": "", "created_by": userId};
//     if("is_deleted" in data) {
//         obj.event_name = "Delete " +table; obj.event_type = "Delete";  obj.event_description = table+" id "+ data.id +' deleted successfully';
//     } else if("is_active" in data) {
//         obj.event_name = "Update " +table; obj.event_type = "Update";  obj.event_description = table+" id "+ data.id+ ''+ (data.is_active ? ' Activated' : ' Inactivated') + ' successfully';
//     } else if(!("id" in data)) {
//         obj.event_name = "Add " + table; obj.event_type = "Insert";  obj.event_description = table + ' added successfully';
//     }
//      else {
//         obj.event_name = "Update " +table; obj.event_type = "Update";  obj.event_description = table+" id "+ data.id +' updated successfully';
//     }
//     logEv.writeEventlog(obj);
// });

// em.on('errorLogEvent', (err) => {
//     //log.error(err.message);
//     logEv.writeErrorlog(err);
// });

// em.on('dbErrorLogEvent', (err) => {
//     log.error(err.stack);
//     logEv.writeErrorlog(err.stack);
// });

// exports.commonEmitter = em;