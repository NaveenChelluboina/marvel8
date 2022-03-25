
const ORM = require('../../associations/table_associations');
//var config = require('../../../config');
const functions = require('../../../lib/functions');


exports.addFleet = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.fleet_name || !data.carrier_id) {
                return reject({success:false , message : "fleet name is missing"});
            }
            let queryWhere = {"fleet_name":data.fleet_name , "is_deleted":0 , "carrier_id":data.carrier_id};
            const Lookups = ORM.model('trs_tbl_fleets');
            return Lookups.findAll({where:queryWhere}).then(lookup => {
                if(!lookup.length) {
                    return Lookups.create(data,{"validate":true , "userId":functions.decrypt(req.session.userId)}).then(data => {
                        if(data) {
                            return resolve({success:true});
                        }
                    }).catch(err => {
                        console.log(err);
                        return reject({success:false , message:"Something went wrong"});
                    });
                } else {
                    return reject({success:false , message:"Fleet already exists"});
                }
            });
        }
        catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

exports.getFleet = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            let orderBy = [];
            const fleets = ORM.model('trs_tbl_fleets');
            let queryWhere = { 'is_deleted': 0 , 'carrier_id':data.carrier_id};
            if ('is_active' in data) {
                queryWhere['is_active'] = data.is_active;
            }
            if ('is_irp' in data) {
                queryWhere['is_irp'] = data.is_irp;
            }
            if ('fleet_name' in data) {
                queryWhere['fleet_name'] = {$like :'%'+data.fleet_name+'%'};
            }
            if("a-z" in data) {
                orderBy = [["fleet_name",  "asc"]];
            }
            if("z-a" in data) {
                orderBy = [["fleet_name",  "desc"]];
            }
            return fleets.findAndCountAll({order:orderBy,where: queryWhere, attributes: ['fleet_id', 'fleet_name', 'comments', 'is_irp', 'is_active','is_deleted']}).then(data => {
                if(data.rows.length) {
                    data.rows.sort(function(a, b) {
                        var titleA = a.fleet_name, titleB = b.fleet_name;
                        if (titleA < titleB) return -1; 
                        if (titleA > titleB) return 1;
                        return 0;
                    });
                }
                return resolve({ "success": true, "results": data.rows, "count": data.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

exports.updateFleet = function(req) {
    return new Promise(async function(resolve,reject) {
        try {
            let data = req.body;
            if(!data.fleet_id) {
                return reject({success:false , message:"Invalid params"});
            }
            const Ideas = ORM.model('trs_tbl_fleets');
            let queryWhere = { "fleet_id": { $in: [data.fleet_id] } };
            let lookupWhere = {'fleet_name':data.fleet_name,"is_deleted":0,"fleet_id": {$notIn:[data.fleet_id]},"carrier_id":data.carrier_id};
            return Ideas.findOne({where:queryWhere}).then(lookup => {
                if(lookup) {
                    return Ideas.findAll({where:lookupWhere}).then(loadedLookup => {
                        if(!loadedLookup.length) {
                            delete data.fleet_id;
                            for(let key in data) {
                                lookup[key] = data[key];
                            }
                            return lookup.save({"validate":true , "userId":functions.decrypt(req.session.userId)}).then(lookups => {
                                return resolve({success:true});
                            }).catch(error => {
                                console.log(error);
                                return reject({success:false , message:"Something went wrong"});
                            });
                        }
                        else {
                            return reject({success:false , message:"Fleet with this details already exists"});
                        }
                    }).catch(error => {
                        console.log(error);
                        return reject({success:false , message:"Something went wrong"});
                    });
                }
                else {
                    return reject({success:false , message:"Fleet not found"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(err) {
            console.log(err);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

// exports.updateFleet = async function(req) {
//     return new Promise(function(resolve, reject) {
//         try {
//             let data = req.body;
//             const Ideas = ORM.model('trs_tbl_fleets');
//             let queryWhere = { "fleet_id": { $in: [data.fleet_id] } };
//             return Ideas.findOne({ where: queryWhere }).then(idea => {
//                 if (idea) {
//                     for (let key in data) {
//                         idea[key] = data[key];
//                     }
//                     return idea.save({ "validate": true, "userId": 1 }).then(ideas => {
//                         return resolve({ "success": true });
//                     }).catch(err => {
//                         console.log(err);
//                         return reject({ success: false, message: 'Something went wrong' });
//                     });
//                 } else {
//                     return reject({ success: false, message: "Category not found" });
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 return reject({ success: false, message: 'Something went wrong' });
//             });
//         } catch (err) {
//             console.log(err);
//             return reject({ success: false, message: 'Something went wrong' });
//         }
//     });
// }

exports.getFleetDropDown = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let data = req.body;
            const fleets = ORM.model('trs_tbl_fleets');
            let queryWhere = {};
            queryWhere['is_deleted'] = 0;
            queryWhere['is_active'] = 1;
            queryWhere['carrier_id'] = data.carrier_id;
            if ("is_irp" in data) {
                queryWhere['is_irp'] =  data.is_irp; 
            }
            return fleets.findAndCountAll({where: queryWhere, attributes: ['fleet_id', 'fleet_name', 'comments', 'is_irp', 'is_active','is_deleted']}).then(data => {
                return resolve({ "success": true, "results": data.rows, "count": data.count });
            }).catch(err => {
                console.log(err);
                return reject({ success: false, message: 'Something went wrong' });
            });
        } catch (err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}