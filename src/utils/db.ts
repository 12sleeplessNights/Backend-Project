import { DataSource } from "typeorm";
import { Faculty } from "../models/objects/faculty";
import { Student } from "../models/objects/student";
import { Course } from "../models/objects/course";
import { StudentAdvisor } from "../models/objects/studentAdvisor";
import { FacultyTeaching } from "../models/teachings/facultyTeaching";
import { ProjectThesis } from "../models/teachings/projectThesis";
import { ProjectThesisFaculty } from "../models/teachings/projectThesisFaculty";
import { ProjectThesisStudent } from "../models/teachings/projectThesisStudent";
import { Teaching, Timetable } from "../models/teachings/teaching";
import { Metadata } from "../models/misc/config";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { TeachingTimetable } from "../models/teachings/teachingTimetable";
import { Activity } from "../models/activityData/activity";
import { ActivityFaculty } from "../models/activityData/activityFaculty";
import { Research } from "../models/research/research";
import { ResearchAuthor } from "../models/research/researchAuthor";
import { AcademicWork } from "../models/research/academicWork";
import { AcademicWorkContrib } from "../models/research/academicWorkContrib";
import { DatabaseType } from "../models/research/databaseType";

dotenv.config();

type JSON = { [k: string]: string };

const dbaddress = process.env.DB_ADDRESS || "localhost";
const dbport = parseInt(process.env.DB_PORT || "3306");
const dbusername = process.env.DB_USER || "root";
const dbpass = process.env.DB_PASSWORD || "";
const dbinsecure = process.env.DB_INSECURE == "true" || false;

export const FacultyDataSource = new DataSource({
  type: "mysql",
  host: dbaddress,
  port: dbport,
  database: "facultywork",
  username: dbusername,
  password: dbpass,
  entities: [
    Faculty,
    Student,
    Course,
    StudentAdvisor,
    FacultyTeaching,
    ProjectThesis,
    ProjectThesisFaculty,
    ProjectThesisStudent,
    Timetable,
    TeachingTimetable,
    Teaching,
    Metadata,
    Activity,
    ActivityFaculty,
    Research,
    ResearchAuthor,
    AcademicWork,
    AcademicWorkContrib,
    DatabaseType,
  ],
  synchronize: true,
  logging: false,
  insecureAuth: dbinsecure,
});

export function initializeDatabase() {
  FacultyDataSource.initialize()
    .then(async () => {
      console.log("Connected to database");
      const isThisThingCachedFetch = await FacultyDataSource.getRepository(
        Metadata,
      ).findOne({
        where: {
          configName: "courseCached",
        },
      });
      const isThisThingCached =
        isThisThingCachedFetch && isThisThingCachedFetch!.data === "true";
      if (isThisThingCached) {
        console.log("Data Check Pass");
      } else {
        console.warn(
          `Warning: No data was found. Please run the the 'import' script first`,
        );
      }
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}
