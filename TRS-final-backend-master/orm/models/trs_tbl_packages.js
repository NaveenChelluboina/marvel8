/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_packages', {
    package_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    package_level: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    package_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    number_of_fleets: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    monthly_price: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    stripe_plan_id:{
      type: DataTypes.STRING(100),
      allowNull: false
    },
    max_asset_size: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified_by: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'trs_tbl_packages',
    updatedAt: 'modified_date',
    createdAt: 'created_date',
    hooks : {
      beforeValidate : function(instance, options) {
        if(!options.userId)
          return sequelize.Promise.reject("Session expired. Please login again");
        let userId = options.userId;
        instance['created_by'] = userId;
        instance['modified_by'] = userId;
      }
    }
  });
};
