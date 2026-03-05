const Room = (sequelize, Sequelize) => {
  const Room = sequelize.define("Room", {
    name: {
      type: Sequelize.STRING,
    },
    size: {
      type: Sequelize.FLOAT,
    },
    temperature: {
      type: Sequelize.FLOAT,
    },
    targetTemperature: {
      type: Sequelize.FLOAT,
    },
  });

  return Room;
};

export default Room;
