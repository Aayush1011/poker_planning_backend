import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  EnumDataType,
} from "sequelize";
import { UUID } from "crypto";

import sequelize from "../utils/database";

interface SessionInterface
  extends Model<
    InferAttributes<SessionInterface>,
    InferCreationAttributes<SessionInterface>
  > {
  id: CreationOptional<string>;
  name: string;
  description: string;
  status: CreationOptional<EnumDataType<string>>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const Session = sequelize.define<SessionInterface>("sessions", {
  id: {
    type: DataTypes.STRING(36),
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT("medium"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "closed"),
    defaultValue: "active",
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: "updated_at",
  },
});

export default Session;
