require("dotenv").config({ path: __dirname + "/../.env" });
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DEV_DATABASE_URL as string, {
  dialect: "postgres",
  host: "localhost",
});

export default sequelize;
