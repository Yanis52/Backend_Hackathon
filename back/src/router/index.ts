import type { Express, ErrorRequestHandler } from "express";
import { HttpCode } from "../http-code/http-error-code";
import { athleteRouter } from "./athlete-router";

export function registerEndpoints(app: Express): void {


  app.use("/athlete", athleteRouter());


    app.use(errorHandler);
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
};