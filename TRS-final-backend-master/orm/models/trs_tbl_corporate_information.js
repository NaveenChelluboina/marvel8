/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_corporate_information', {
    corporate_information_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    carrier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_carriers',
        key: 'carrier_id'
      }
    },
    company_legal_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    company_dba: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    state_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    address_1: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    
    zip_code: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fax: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    carrier_type: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    us_dot: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    us_dot_pin: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    mc_number: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    mc_portal_user: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    mc_pin: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    employee_id_number: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    ifta_account: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    irp_account: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    // irp_fleet_1_exp: {
    //   type: DataTypes.DATE,
    //   allowNull: true
    // },
    // irp_fleet_2_exp: {
    //   type: DataTypes.DATE,
    //   allowNull: true
    // },
    ins_policy: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    ins_policy_exp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    kyu: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    nm_wdt: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    ny_hut: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    oregon_mc_permit: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    scac_code: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    quebec_neq: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    ins_company: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    us_cbp_dtops_acc: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    national_safety_code: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    federal_business: {
      type: DataTypes.STRING(15),
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
    modified_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'trs_tbl_corporate_information',
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
