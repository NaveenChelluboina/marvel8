/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trs_tbl_countries', {
    country_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    country_short_code: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    country_phonecode: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    country_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    is_active: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    is_deleted: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1'
    }
  }, {
    tableName: 'trs_tbl_countries',
    timestamps:false
  });
};
