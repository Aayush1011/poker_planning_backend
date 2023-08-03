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
  sessionId: ForeignKey<UUID>;
  name: string;
  description: TextDataType;
  status: EnumDataType<string>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const Story = sequelize.define<StoryInterface>("stories", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    autoIncrement: true,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "session_id",
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
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
