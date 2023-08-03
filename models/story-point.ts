import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
} from "sequelize";
import { UUID } from "crypto";

import sequelize from "../utils/database";

interface StoryPointInterface
  extends Model<
    InferAttributes<StoryPointInterface>,
    InferCreationAttributes<StoryPointInterface>
  > {
  sessionId: ForeignKey<UUID>;
  storyId: ForeignKey<number>;
  userId: ForeignKey<number>;
  points: number;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const StoryPoint = sequelize.define<StoryPointInterface>("story-points", {
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    field: "session_id",
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: "story_id",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: "user_id",
  },
  points: {
    type: DataTypes.INTEGER,
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

export default StoryPoint;
