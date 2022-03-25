/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_home_alerts', {
    document_id: {
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
    documentName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    documentType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    referene: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    expiringDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    difference: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    document: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    is_deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp')
    }
  }, {
    tableName: 'trs_tbl_home_alerts',
    createdAt:"created_date",
    updatedAt:"created_date"
  });
};
