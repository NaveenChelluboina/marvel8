/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_driver_asset_history', {
    asset_history_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_drivers',
        key: 'driver_id'
      }
    },
    asset_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'trs_tbl_assets',
        key: 'asset_id'
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'trs_tbl_driver_asset_history',
    timestamps:false
  });
};
