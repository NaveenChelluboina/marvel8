/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_users', {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password_reset_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_roles',
        key: 'role_id'
      }
    },
    carrier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_carriers',
        key: 'carrier_id'
      }
    },
    user_type: {
      type: DataTypes.INTEGER(1),
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
    tableName: 'trs_tbl_users',
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
