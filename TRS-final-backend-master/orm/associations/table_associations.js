var filesystem = require('fs');
var models = {};

var association = function association() {
    var Sequelize = require("sequelize");
    var DataTypes = require("sequelize").DataTypes;
    var sequelize = null;
    var modelsPath = "";
    var logger;
    this.setup = function (path, database, username, password, consoleLogger, obj){
        modelsPath = path;
        logger = consoleLogger;
        sequelize = new Sequelize(database, username, password, obj);     
        sequelize.authenticate().then(function(result) {
            console.log("connected to db " + database);
            console.log(database + " => " + username + " => " + password );
        }).catch(function(err) {
            console.log(err);
        });
        init();
    }
    
    this.model = function (name){
        return models[name];
    }
    
    this.Seq = function (){
        return Sequelize;
    }
    
    this.getObj = function() {
        return sequelize;
    }
    
    function setAssociations() {
        models["trs_tbl_roles"].hasMany(models["trs_tbl_permissions"], { foreignKey : 'role_id' , targetKey : 'role_id'} );
        models["trs_tbl_drivers"].hasMany(models["trs_tbl_driver_documents"], { foreignKey : 'driver_id' , targetKey : 'driver_id'} );
        models["trs_tbl_corporate_information"].hasMany(models["trs_tbl_corporate_info_documents"], { foreignKey : 'corporate_information_id' , targetKey : 'corporate_information_id'} );
        models["trs_tbl_permissions"].hasOne(models["trs_tbl_right_master"], { foreignKey : 'right_master_id' , targetKey : 'right_master_id'} );
        models["trs_tbl_users"].hasOne(models["trs_tbl_roles"], { foreignKey : 'role_id' , targetKey : 'role_id'} );
        models["trs_tbl_drivers"].hasOne(models["trs_tbl_countries"], { foreignKey : 'country_id' , targetKey : 'country_id'} );
        models["trs_tbl_drivers"].hasOne(models["trs_tbl_states"], { foreignKey : 'state_id' , targetKey : 'state_id'} );
        models["trs_tbl_corporate_information"].hasOne(models["trs_tbl_countries"], { foreignKey : 'country_id' , targetKey : 'country_id'} );
        models["trs_tbl_corporate_information"].hasOne(models["trs_tbl_states"], { foreignKey : 'state_id' , targetKey : 'state_id'} );
        models["trs_tbl_assets"].hasMany(models["trs_tbl_asset_documents"], { foreignKey : 'asset_id' , targetKey : 'asset_id'} );
        models["trs_tbl_assets"].hasOne(models["trs_tbl_fleets"], { foreignKey : 'fleet_id' , targetKey : 'fleet_id'} );
        models["trs_tbl_assets"].hasOne(models["trs_tbl_asset_type"], { foreignKey : 'asset_type_id' , targetKey : 'asset_type_id'} );
        models["trs_tbl_assets"].hasOne(models["trs_tbl_asset_make"], { foreignKey : 'asset_make_id' , targetKey : 'asset_make_id'} );
        models["trs_tbl_irs"].hasMany(models["trs_tbl_irs_year_documents"], { foreignKey : 'irs_id' , targetKey : 'irs_id'} );
        models["trs_tbl_irs_year_documents"].hasMany(models["trs_tbl_irs_assets_for_document"], { foreignKey : 'document_id' , targetKey : 'document_id'} );
        models["trs_tbl_irs_assets_for_document"].hasOne(models["trs_tbl_assets"], { foreignKey : 'asset_id' , targetKey : 'asset_id'} );
        models["trs_tbl_permissions"].hasOne(models["trs_tbl_right_master"], { foreignKey : 'right_master_id' , targetKey : 'right_master_id'} );
        models['trs_tbl_users'].hasOne(models['trs_tbl_roles'],{ foreignKey : 'role_id' , targetKey : 'role_id' });
        // models["trs_tbl_irp"].hasMany(models["trs_tbl_irp_fleet_year"], { foreignKey : 'irp_id' , targetKey : 'irp_id'} );
        // models["trs_tbl_irp"].hasMany(models["trs_tbl_irp_fleet_documents"], { foreignKey : 'irp_id' , targetKey : 'irp_id'} );
        // models["trs_tbl_irp"].hasMany(models["trs_tbl_irp_weight_groups"], { foreignKey : 'irp_id' , targetKey : 'irp_id'} );
        // models["trs_tbl_irp"].hasMany(models["trs_tbl_fleets"], { foreignKey : 'fleet_id' , targetKey : 'fleet_id'} );
        models["trs_tbl_irp"].hasMany(models["trs_tbl_irp_fleet_year"], { foreignKey : 'irp_id' , targetKey : 'irp_id'} );
        models["trs_tbl_irp_fleet_year"].hasMany(models["trs_tbl_irp_fleet_documents"], { foreignKey : 'year_id' , targetKey : 'year_id'} );
        models["trs_tbl_irp"].hasMany(models["trs_tbl_irp_weight_groups"], { foreignKey : 'irp_id' , targetKey : 'irp_id'} );
        models["trs_tbl_fleets"].hasOne(models["trs_tbl_irp"], { foreignKey : 'fleet_id' , targetKey : 'fleet_id'} );
        models["trs_tbl_users"].hasOne(models["trs_tbl_carriers"], { foreignKey : 'carrier_id' , targetKey : 'carrier_id'} );
        models["trs_tbl_drivers"].hasOne(models["trs_tbl_carriers"], { foreignKey : 'carrier_id' , targetKey : 'carrier_id'} );
        models["trs_tbl_ifta_assets"].hasOne(models["trs_tbl_fleets"], { foreignKey : 'fleet_id' , targetKey : 'fleet_id'} );
        models["trs_tbl_ifta_assets"].hasOne(models["trs_tbl_assets"], { foreignKey : 'asset_id' , targetKey : 'asset_id'} );
        models['trs_tbl_settings_for_carriers'].hasOne(models['trs_tbl_settings'],{ foreignKey : 'settings_id' , targetKey : 'settings_id' });
        models['trs_tbl_carriers'].hasOne(models['trs_tbl_packages'],{ foreignKey : 'package_id' , targetKey : 'package_id' });
        models["trs_tbl_carriers"].hasOne(models["trs_tbl_countries"], { foreignKey : 'country_id' , targetKey : 'country_id'} );
        models["trs_tbl_carriers"].hasOne(models["trs_tbl_states"], { foreignKey : 'state_id' , targetKey : 'state_id'} );
        models["trs_tbl_packages"].hasMany(models["trs_tbl_carriers"], { foreignKey : 'package_id' , targetKey : 'package_id'} );
        models["trs_tbl_drivers"].hasOne(models["trs_tbl_assets"], { foreignKey : 'asset_id' , targetKey : 'asset_id'} );
        models["trs_tbl_assets"].hasMany(models["trs_tbl_drivers"], { foreignKey : 'current_active_asset_id' , targetKey : 'current_active_asset_id'} );
        models["trs_tbl_assets"].hasOne(models["trs_tbl_states"], { foreignKey : 'state_id' , targetKey : 'state_id'} );
        models["trs_tbl_document_share_history"].hasOne(models["trs_tbl_drivers"], { foreignKey : 'driver_id' , targetKey : 'driver_id'} );
        models["trs_tbl_driver_asset_history"].hasOne(models["trs_tbl_drivers"], { foreignKey : 'driver_id' , targetKey : 'driver_id'} );
        models["trs_tbl_driver_asset_history"].hasOne(models["trs_tbl_assets"], { foreignKey : 'asset_id' , targetKey : 'asset_id'} );
        models["trs_tbl_assets"].hasMany(models["trs_tbl_driver_asset_history"], { foreignKey : 'asset_id' , targetKey : 'asset_id'} );
    }
    
    function init() {
        filesystem.readdirSync(modelsPath).forEach(function(name){
            if(name.indexOf(".swp") == -1) {
                var modelName = name.replace(/\.js$/i, "");
                var object = require("../models/" + modelName)(sequelize,DataTypes);
                models[modelName] = object;
            }
            else {
                logger.log(name);
            }
        });
        setAssociations();
    }
}

association.instance = null;

association.getInstance = function() {
    if(this.instance === null){
        this.instance = new association();
    }
    return this.instance;
}

module.exports = association.getInstance();

