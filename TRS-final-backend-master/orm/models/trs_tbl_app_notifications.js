/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_app_notifications', {
    app_notification_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    app_notification_message: {
      type: DataTypes.TEXT,
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
    driver_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'trs_tbl_drivers',
        key: 'driver_id'
      }
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
  }, {
    tableName: 'trs_tbl_app_notifications',
    timestamps:false
  });
};
