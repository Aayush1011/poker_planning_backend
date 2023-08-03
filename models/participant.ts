import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  EnumDataType,
} from "sequelize";
import { UUID } from "crypto";

import sequelize from "../utils/database";

interface ParticipantInterface
  extends Model<
    InferAttributes<ParticipantInterface>,
    InferCreationAttributes<ParticipantInterface>
  > {
  userId: ForeignKey<number>;
  sessionId: ForeignKey<string>;
  role: string;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const Participant = sequelize.define<ParticipantInterface>("participants", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: "user_id",
  },
  sessionId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
    field: "session_id",
  },
  role: {
    type: DataTypes.ENUM("moderator", "member"),
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

export default Participant;
