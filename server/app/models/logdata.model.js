const Logdata = (sequelize, Sequelize) => {
  const Logdata = sequelize.define("Logdata", {
    temperature: {
      type: Sequelize.FLOAT,
    },
    humidity: {
      type: Sequelize.FLOAT,
    },    
    updated_at: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },    
  }, { timestamps: false });

  return Logdata;
};

export default Logdata;