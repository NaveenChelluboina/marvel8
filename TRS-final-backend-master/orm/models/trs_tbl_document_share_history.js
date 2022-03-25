/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_document_share_history', {
    share_history_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    shared_to_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    shared_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    document_type: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    document_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_drivers',
        key: 'driver_id'
      }
    },
    carrier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'trs_tbl_carriers',
        key: 'carrier_id'
      }
    }
  }, {
    tableName: 'trs_tbl_document_share_history',
    timestamps:false
  });
};
