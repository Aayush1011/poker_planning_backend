import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import sequelize from "../utils/database";

export interface UserInterface
  extends Model<
    InferAttributes<UserInterface>,
    InferCreationAttributes<UserInterface>
  > {
  id: CreationOptional<Number>;
  userName: string;
  email: string;
  hashedPassword: string;
  refreshToken: CreationOptional<string>;
  refreshTokenExpiresAt: CreationOptional<string>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export const User = sequelize.define<UserInterface>("users", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  userName: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: {
      name: "username",
      msg: "Username already taken",
    },
    validate: {
      notEmpty: {
        msg: "Username has to be provided",
      },
      len: {
        args: [5, 16],
        msg: "Username has to be between 5 to 16 characters in length",
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: "email",
      msg: "Email address already exists",
    },
    validate: {
      isEmail: {
        msg: "Invalid email format",
      },
      notEmpty: {
        msg: "Email has to be provided",
      },
    },
  },
  hashedPassword: {
    type: DataTypes.STRING(72),
    allowNull: false,
    field: "hashed_password",
  },
  refreshToken: {
    type: DataTypes.STRING(36),
    allowNull: true,
    field: "refresh_token",
  },
  refreshTokenExpiresAt: {
    type: DataTypes.STRING(24),
    allowNull: true,
    field: "refresh_token_expires_at",
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
