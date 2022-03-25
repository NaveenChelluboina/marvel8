/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_carriers', {
    carrier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    carrier_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    package_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_packages',
        key: 'package_id'
      }
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    carrier_stripe_name: {
      type: DataTypes.STRING(100),
      allowNull: true 
    },
    carrier_email: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    company_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    carrier_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    carrier_phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    zip: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    state_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_states',
        key: 'state_id'
      }
    },
    country_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_countries',
        key: 'country_id'
      }
    },
    is_active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    request_from: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    conversion_token: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    subscription_end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    terms_and_conditions_acceptance_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'trs_tbl_carriers',
    createdAt: 'created_date',
    updatedAt: 'created_date',
  });
};
