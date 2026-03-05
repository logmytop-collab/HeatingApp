const Strang = (sequelize, Sequelize) => {
  const Strang = sequelize.define("Strang", {
    name: {
      type: Sequelize.STRING,
    },
    pin1: {
      type: Sequelize.TINYINT,
    },
    pin2: {
      type: Sequelize.TINYINT,
    },
    currentPos: {
      type: Sequelize.INTEGER(1),
      default: 0,
    },
    maxPos: {
      type: Sequelize.INTEGER(1),
      default: 10000,
    },
    state: {
      type: Sequelize.TINYINT,
    },
  });

  return Strang;
};

export default Strang;
