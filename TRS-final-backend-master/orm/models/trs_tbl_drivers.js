/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_drivers', {
    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    driver_first_name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    driver_last_name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    cell_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email_address: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    is_verified: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dl_number: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    dl_class: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    is_active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    is_deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    carrier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_carriers',
        key: 'carrier_id'
      }
    },
    address1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // address2: {
    //   type: DataTypes.TEXT,
    //   allowNull: true
    // },
    city: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    country_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_countries',
        key: 'country_id'
      }
    },
    state_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_states',
        key: 'state_id'
      }
    },

    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    inactive_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    comments: {
      type: DataTypes.STRING(255),
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
    current_active_asset_id:{
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'trs_tbl_carriers',
        key: 'carrier_id'
      }
    },
    driver_profoile_pic_url:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    driver_firebase_id:{
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'trs_tbl_drivers',
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
