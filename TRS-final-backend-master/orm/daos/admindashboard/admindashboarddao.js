const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const commonemitter = require('../../../lib/custom-events').commonEmitter;
const ORM = require('../../associations/table_associations');
const functions = require('../../../lib/functions');
const async = require('async');
const sgMail = require('@sendgrid/mail');
// const sgMail = require('@sendgrid/mail');
var config = require('../../../config');
var Sequelize = require("sequelize");
var _ = require('underscore');
var param = process.argv[2];
var originurl = config[param];
var originServerUrl = config[param+'Serv'];
const winston = require('winston');
const appDetails = require('../../../app');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

//MARK:- Api's for card data
exports.dashboardData = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            let finalObj = {};
            let packageArray = [];
            const clients = ORM.model('trs_tbl_carriers');
            let queryWhere = {};
            queryWhere['carrier_id'] = {'$notIn':[1]};
            clients.findAndCountAll({where:queryWhere}).then( async (client) => {
                finalObj["totalclients"] = client.count;
                let activeClients = await getActiveClients();
                if(activeClients){
                    finalObj["activeclients"] = activeClients.results;
                }
                client.rows.forEach(element => {
                    element = element.get({plain:true});
                    packageArray.push(element.package_id);
                }) 
                let popularFleet = await getPopularFleetSize(mode(packageArray));
                if(popularFleet){
                    finalObj["popular_fleet"] = popularFleet.results;
                }
                let getnewSubscribers = await getNewSub();
                if(getnewSubscribers){
                    finalObj["new_subscribers"] = getnewSubscribers.results
                }
                let totalAmount = await getMonthRevenue();
                if(totalAmount){
                    finalObj["monthly_revenue"] = totalAmount.results;
                    finalObj["yearly_revenue"] = totalAmount.results * 12;
                }
                return resolve({success:true , results:finalObj});
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
        } catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}
//to fecth repeated number:-

function getActiveClients() {
    return new Promise(async function(resolve,reject) {
        try {
            const carriers = ORM.model('trs_tbl_carriers');
            let queryWhere = {};
                queryWhere['carrier_id'] = {'$notIn':[1]};
                queryWhere['is_active'] = 1;
            return carriers.findAndCountAll({where:queryWhere}).then(async (carrier) => {
                if(carrier) {
                    return resolve({success:true , results: carrier.count});
                }
                else {
                    return resolve({success:true ,results:[], message:"Something went wrong"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

function getPopularFleetSize(packageId) {
    return new Promise(async function(resolve,reject) {
        try {
            const package = ORM.model('trs_tbl_packages');
            let querywhere = {'package_id' : packageId}
            return package.findOne({where:querywhere}).then(package => {
                if(package) {
                    return resolve({success:true , results: package.number_of_fleets});
                }
                else {
                    return resolve({success:true ,results:[], message:"Something went wrong"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    }); 
}

function getNewSub() {
    return new Promise(async function(resolve,reject) {
        try {
            var myDate = new Date().setHours(0, 0, 0, 0);
            var nowDate = new Date();
            let queryWhere = {};
            const carriers = ORM.model('trs_tbl_carriers');
             queryWhere['created_date'] = {
                $gte: new Date(myDate), $lt: new Date(nowDate)
            }
            return carriers.findAndCountAll({where:queryWhere}).then(carrier => {
                if(carrier) {
                    return resolve({success:true , results: carrier.count});
                }
                else {
                    return resolve({success:true ,results:[], message:"Something went wrong"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}
function getMonthRevenue() {
    return new Promise(async function(resolve,reject) {
        try {
            var date = new Date();
            var finalAmount = 0;
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            let queryWhere = {};
            queryWhere['carrier_id'] = {'$notIn':[1]};
            const carriers = ORM.model('trs_tbl_carriers');
             queryWhere['created_date'] = {
                $gte: new Date(firstDay), $lt: new Date(lastDay)
            }
            return carriers.findAndCountAll({where:queryWhere}).then(async (carrier) => {
                if(carrier) {
                    for (let i in carrier.rows){
                      let flag = await getPackagePrice(carrier.rows[i].package_id);
                       finalAmount += parseInt(flag.results.split('$')[1]);
                    }
                    return resolve({success:true , results: finalAmount});
                }
                else {
                    return resolve({success:true ,results:[], message:"Something went wrong"});
                }
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            });
        }
        catch(error) {
            console.log(error);
            return reject({success:false , message:"Something went wrong"});
        }
    });
}

function getPackagePrice(package_id) {
    return new Promise(function(resolve, reject) {
       const packages = ORM.model('trs_tbl_packages');
       let queryWhere = {"package_id" : package_id};
        return packages.findOne({where:queryWhere}).then(data => {
         if(data)
            return resolve({"success":true, results:data.monthly_price});
        }).catch(error => {
            console.log(error);
            return reject({"success":false, "message":"Something went wrong"});
        }); 
    });
}

//MARK:- subscriber distribution api's
exports.dashboardSubricibersData = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            const clients = ORM.model('trs_tbl_carriers');
            var finalArray = [];
            var canada = {};
            var usa = {};
            clients.findAndCountAll({where:{"carrier_id" : {'$notIn':[1]}}}).then( async (client) => {
                let canadaCount = 0;
                let usaCount = 0;
               for(let i in client.rows){
                  if(client.rows[i].country_id == 231){
                     usaCount += 1;
                  } else {
                    canadaCount += 1;
                  }
               }
               canada["name"] = "Canada" ;
               canada["value"] = canadaCount;
               usa["name"] = "USA";
               usa["value"] = usaCount;
               finalArray.push(canada);
               finalArray.push(usa);
                return resolve({success:true , results:finalArray});
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
        } catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

//MARK:- fleet distribution api's

exports.dashboardFleetsData = async function(req) {
    return new Promise(function(resolve, reject) {
        try {
            const clients = ORM.model('trs_tbl_carriers');
            var finalArray = [];
             var fleet1 = {};
             var fleet2 = {};
             var fleet3 = {};
             var fleet4 = {};
             var fleet5 = {};
             var fleet6 = {};
             var fleet7 = {};
            clients.findAndCountAll({where:{"carrier_id" : {'$notIn':[1]}}}).then( async (client) => {
                var p1 = 0;
                var p2 = 0;
                var p3 = 0;
                var p4 = 0;
                var p5 = 0;
                var p6 = 0;
                var p7 = 0;

               for(let i in client.rows){
                  if(client.rows[i].package_id == 1){
                     p1 += 1;
                  } else if(client.rows[i].package_id == 2){
                    p2 += 1;
                  }
                  else if(client.rows[i].package_id == 3){
                    p3 += 1;
                  }
                  else if(client.rows[i].package_id == 4){
                    p4 += 1;
                  }
                  else if(client.rows[i].package_id == 5){
                    p5 += 1;
                  }
                  else if(client.rows[i].package_id == 6){
                    p6 += 1;
                  }
                  else {
                      p7 +=1;
                  }
               }

               fleet1["name"] = "1-2" ;
               fleet1["value"] = p1;
               finalArray.push(fleet1);

               fleet2["name"] = "3-6";
               fleet2["value"] = p2;
               finalArray.push(fleet2);
              
               fleet3["name"] = "7-14";
               fleet3["value"] = p3;
               finalArray.push(fleet3);

               fleet4["name"] = "15-25";
               fleet4["value"] = p4;
               finalArray.push(fleet4);

               fleet5["name"] = "26-50";
               fleet5["value"] = p5;
               finalArray.push(fleet5);

               fleet6["name"] = "51-75";
               fleet6["value"] = p6;
               finalArray.push(fleet6);

               fleet7["name"] = "76-100";
               fleet7["value"] = p7;
               finalArray.push(fleet7);

             return resolve({success:true , results:finalArray});
            }).catch(err => {
                console.log(err);
                return reject({success:false , message:"Something went wrong"});
            })
        } catch(err) {
            console.log(err);
            return reject({ success: false, message: 'Something went wrong' });
        }
    });
}

           
//MARK:- Line chart api
// exports.dashboardLineChartData = async function(req) {
//     return new Promise(function(resolve, reject) {
//         try {
//             const clients = ORM.model('trs_tbl_carriers');
//             return clients.findAll({ 
//                 attributes:[
//                     [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_date'), '%M'), 'name'],
//                     [Sequelize.literal(`COUNT(*)`), 'value']],
//                      group:[Sequelize.fn('MONTH', Sequelize.col('created_date'))]
//             }).then(client => {
//                   console.log(client);
//              return resolve({success:true , results:client});
//             }).catch(err => {
//                 console.log(err);
//                 return reject({success:false , message:"Something went wrong"});
//             })
//         } catch(err) {
//             console.log(err);
//             return reject({ success: false, message: 'Something went wrong' });
//         }
//     });
// }

exports.dashboardLineChartData = async function(req) {
    return new Promise(function (resolve, reject) {
        try {
            let data = req.body;
            const Opportunities = ORM.model('trs_tbl_carriers');
            let queryWhere = {};
            queryWhere['carrier_id'] = {'$notIn':[1]};
            // console.log(queryWhere,"Dashboard");
            if("created_date" in data)
                queryWhere['created_date'] = {$gte: new Date(data.created_date + '-01-01'), $lt: new Date(data.created_date + '-12-31')};
            return Opportunities.findAll({
                attributes: [
                    [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_date'), '%M'), 'name'],
                    [Sequelize.literal(`COUNT(*)`), 'value']
                ],
                where: queryWhere,
                group: [Sequelize.fn('MONTH', Sequelize.col('created_date'))]
            }).then(async (opps) => {
                let getFinal = await generateMonthsData(opps);
                // console.log(getFinal);
                return resolve({ "success": true, "results": getFinal });
            }).catch(err => {
                console.log(err);
                return reject({ "success": false, "message": "Something went wrong" });
            });
        } catch (err) {
            console.log(err);
            return reject({ "success": false, "message": "Something went wrong" });
        }
    })
}
function generateMonthsData(arr) {
    let temp = [];
    let months = { "January": 0, "February": 0, "March": 0, "April": 0, "May": 0, "June": 0, "July": 0, "August": 0, "September": 0, "October": 0, "November": 0, "December": 0 };
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].get({ plain: true });
        // console.log(arr[i])
        if (arr[i]['name'] in months) {
            months[arr[i]['name']] = arr[i]['value'];
        }
    }
    for (let key in months) {
        let obj = {};
        obj['name'] = key;
        obj['value'] = months[key];
        temp.push(obj);
    }
    return temp;
}
