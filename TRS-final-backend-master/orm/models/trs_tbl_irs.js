/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_irs', {
    irs_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    year: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    is_deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
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
    carrier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_carriers',
        key: 'carrier_id'
      }
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'trs_tbl_irs',
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
