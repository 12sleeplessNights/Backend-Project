/* eslint-disable @typescript-eslint/no-unused-vars */
// src/index.ts
import express, { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import "reflect-metadata";
import multer from "multer";

import { GETstudentDevelopment } from "./endpoints/studentDevelopmentInfo";
import { parseCSVintoObjectSync } from "./utils/utils";
import { initializeDatabase } from "./utils/db";
import cors from "cors";
import { GETprojectAdvisor } from "./endpoints/projectThesis";
import { GETteachingSchedule } from "./endpoints/teaching";
import { GETActivityRepoData } from "./endpoints/activity";
import { GETResearchData } from "./endpoints/research";
import { GETAcademicWorks } from "./endpoints/books";
import { GetProfile, GetWorkload } from "./endpoints/profile";
import { activityUploadHandler } from "./endpoints/upload";
declare global {
  // eslint-disable-next-line no-var
  var appRoot: string;
}
global.appRoot = path.resolve(__dirname);

const app: Express = express();
const port = process.env.PORT || 3000;

const directories = ["./data", "./test_data", "./uploads"];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(express.json());
initializeDatabase();
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Faculty Management Backend Server :+1:");
});

const upload = multer({ dest: "./uploads/" });

app.get("/api/v1/student-development/advisor", GETstudentDevelopment);
app.get(
  "/api/v1/advisor-participation",
  async (r: express.Request, s: express.Response) => {
    GETActivityRepoData(r, s, 1);
  },
);
app.get(
  "/api/v1/academic-services",
  async (r: express.Request, s: express.Response) => {
    GETActivityRepoData(r, s, 2);
  },
);
app.get(
  "/api/v1/administrative-tasks",
  async (r: express.Request, s: express.Response) => {
    GETActivityRepoData(r, s, 3);
  },
);
app.get(
  "/api/v1/maintenance",
  async (r: express.Request, s: express.Response) => {
    GETActivityRepoData(r, s, 4);
  },
);
app.get("/api/v1/project-advisor", GETprojectAdvisor);
app.get("/api/v1/teaching-schedule", GETteachingSchedule);

app.get("/api/v1/research-articles", GETResearchData);
app.get("/api/v1/books", GETAcademicWorks);

app.get("/api/v1/profile/workload", GetWorkload);
app.get("/api/v1/profile/profile-info", GetProfile);

app.post(
  "/api/v1/upload/activity",
  upload.single("file"),
  activityUploadHandler,
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
