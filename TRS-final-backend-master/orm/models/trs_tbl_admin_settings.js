module.exports = function(sequelize, DataTypes) {
    return sequelize.define('trs_tbl_admin_settings', {
      settings_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      setting_value: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      modified_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      modified_by: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    }, {
      tableName: 'trs_tbl_admin_settings',
      updatedAt: 'modified_date',
      createdAt: 'modified_date',
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
  