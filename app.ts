import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { ValidationError } from "sequelize";
import cookieParser from "cookie-parser";

import Session from "./models/session";
import Story from "./models/story";
import Participant from "./models/participant";
import StoryPoint from "./models/story-point";
import { CustomError } from "./utils/error";
import userRoutes from "./routes/user";
import sequelize from "./utils/database";
import sessionRoutes from "./routes/session";

const app: Application = express();

app.use(cookieParser());
app.use(bodyParser.json()); // application/json

app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.options("/*", (_, res) => {
  res.sendStatus(200);
});

app.use("/user", userRoutes);
app.use("/session", sessionRoutes);

Session.hasMany(Story, {
  sourceKey: "id",
  foreignKey: "sessionId",
  as: "fk_session_stories",
});
// Story.belongsTo(Session);
Session.hasMany(Participant, {
  sourceKey: "id",
  foreignKey: "sessionId",
  as: "fk_session_participants",
});
Session.hasMany(Participant, {
  sourceKey: "id",
  foreignKey: "sessionId",
  as: "participants",
});
// Participant.belongsTo(Session);
Session.hasMany(StoryPoint, {
  sourceKey: "id",
  foreignKey: "sessionId",
  as: "fk_session_story-points",
});
// StoryPoint.belongsTo(Session);
Participant.hasMany(StoryPoint, {
  sourceKey: "userId",
  foreignKey: "userId",
  as: "fk_participant_story-points",
});
// StoryPoint.belongsTo("Participant")
Story.hasMany(StoryPoint, {
  sourceKey: "id",
  foreignKey: "storyId",
  as: "fk_story_story_points",
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  if (error instanceof CustomError) {
    const status = error.statusCode;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  } else if (error instanceof ValidationError) {
    const errorObject: { [key: string]: string } = {};
    error.errors.map((err) => {
      if (err.path) {
        errorObject[err.path] = err.message;
      }
    });
    res.status(400).json({ data: errorObject });
  } else {
    res.status(500).json({ message: "Sorry an error occurred" });
  }
});

sequelize.sync({ alter: true }).then(() => {
  app.listen(5000, () => {
    console.log("\n\nServer is listening at http://localhost:5000\n\n");
  });
});
