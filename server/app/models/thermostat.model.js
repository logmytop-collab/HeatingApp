const Thermostat = (sequelize, Sequelize) => {
  const Thermostat = sequelize.define("Thermostat", {
    name:  Sequelize.STRING(50),    
    temperature: Sequelize.FLOAT,
    humidity:Sequelize.FLOAT,
    battery:  Sequelize.TINYINT,
    deviceID: Sequelize.STRING(50),
    },
    { indexes: [
      {
        fields: ['deviceID'],
        unique: true,
      }]
    },
    );

  return Thermostat;
};

export default Thermostat;
