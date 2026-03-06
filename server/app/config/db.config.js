export const HOST = "mariadb";
export const USER = "root";
//export const PASSWORD = "Markus@1967";
export const PASSWORD = "kingroot";
//export const DB = "HClocal";
export const DB = "heatingdb";
export const dialect = "mariadb";
export const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};
