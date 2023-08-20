import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  EnumDataType,
  TextDataType,
} from "sequelize";
import { UUID } from "crypto";

import sequelize from "../utils/database";

interface StoryInterface
  extends Model<
    InferAttributes<StoryInterface>,
    InferCreationAttributes<StoryInterface>
  > {
  id: CreationOptional<number>;
  sessionId: ForeignKey<string>;
  userId: ForeignKey<number>;
  name: string;
  description: string;
  status: CreationOptional<EnumDataType<string>>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const Story = sequelize.define<StoryInterface>("stories", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    field: "session_id",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id",
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
    type: DataTypes.ENUM("active", "closed", "pending"),
    defaultValue: "pending",
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

export default Story;
