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

import mysql from "mysql2/promise";

import { readCSVNoChecks, JSON } from "../utils/utils";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var appRoot: string;
}
import dotenv from "dotenv";
import { TeachingTimetable } from "../models/teachings/teachingTimetable";
import { AcademicWork } from "../models/research/academicWork";
import { Activity } from "../models/activityData/activity";
import { ActivityFaculty } from "../models/activityData/activityFaculty";
import { Research } from "../models/research/research";
import { ResearchAuthor } from "../models/research/researchAuthor";
import { AcademicWorkContrib } from "../models/research/academicWorkContrib";
import { DatabaseType } from "../models/research/databaseType";
import { importCourseData } from "./data_importers/coursedata";
import { importFacultyData } from "./data_importers/facultydata";
import { importStudentMajorData } from "./data_importers/studentmajor";
import { importStudentFacultyThesisData } from "./data_importers/thesisdata";
import { importAdvisorData } from "./data_importers/advisordata";
import { importTimetableData } from "./data_importers/timetabledata";
import { importTeachingData } from "./data_importers/teachingdata";
import { importTimetableTeaching } from "./data_importers/timetableteachingdata";
import { importFacultyTeaching } from "./data_importers/facultyteaching";
import { importSeniorProjectDataFromAPI } from "./data_importers/seniorprojectdata";
import { importIndividualStudyData } from "./data_importers/indivstudydata";
import { importActivityData } from "./data_importers/activitydata";
import { importActivityFacultyData } from "./data_importers/activityFaculty";
import { importResearchData } from "./data_importers/researchdata";
import { importDatabaseTypeData } from "./data_importers/databasetypedata";
import { importResearchAuthorData } from "./data_importers/researchAuthor";
import { importAcademicWorks } from "./data_importers/academicworks";
dotenv.config({
  path: ".env",
});
global.appRoot = path.resolve(__dirname + "/../");

const dbaddress = process.env.DB_ADDRESS || "localhost";
const dbport = parseInt(process.env.DB_PORT || "3306");
const dbusername = process.env.DB_USER || "root";
const dbpass = process.env.DB_PASSWORD || "";
const dbinsecure = process.env.DB_INSECURE == "true" || false;

const FacultyDataSource = new DataSource({
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

function initializeData() {
  const importWhat = process.argv[2];
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
      if (!isThisThingCached || importWhat !== null) {
        const courseRepo = FacultyDataSource.getRepository(Course);
        const facultyRepo = FacultyDataSource.getRepository(Faculty);
        const studentRepo = FacultyDataSource.getRepository(Student);
        const teachingRepo = FacultyDataSource.getRepository(Teaching);
        const timetableRepo = FacultyDataSource.getRepository(Timetable);
        const activityRepo = FacultyDataSource.getRepository(Activity);
        const studentAdvisorRepo =
          FacultyDataSource.getRepository(StudentAdvisor);
        //const projThesisRepo = FacultyDataSource.getRepository(ProjectThesis);
        const researchRepo = FacultyDataSource.getRepository(Research);
        const dg206: JSON[] = readCSVNoChecks("DG0206 (1)");

        const dg216: JSON[] = readCSVNoChecks("DG0216");
        const uniqueDg216 = dg216.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.COURSE_CODE === value.COURSE_CODE &&
                t.SEMESTER === value.SEMESTER &&
                t.ACAD_YEAR === value.ACAD_YEAR &&
                t.SECTION === value.SECTION &&
                t.NAME_ABBR === value.NAME_ABBR,
            ),
        );
        // so it can be reused
        // course data
        if (importWhat == null || importWhat === "course")
          await importCourseData(courseRepo);
        // faculty data
        if (importWhat == null || importWhat === "facultydata")
          await importFacultyData(facultyRepo);
        // student major
        if (importWhat == null || importWhat === "studentmajor")
          await importStudentMajorData(studentRepo);
        // advisor data
        if (importWhat == null || importWhat === "advisor")
          await importAdvisorData(studentRepo, facultyRepo, studentAdvisorRepo);
        // timetable data
        if (importWhat == null || importWhat === "timetable")
          await importTimetableData(dg206, timetableRepo);
        // teaching
        if (importWhat == null || importWhat === "teaching")
          await importTeachingData(courseRepo, teachingRepo, dg206);
        // time table faculty teaching
        if (importWhat == null || importWhat === "timetableFaculty")
          await importTimetableTeaching(dg206, teachingRepo, timetableRepo);
        // faculty teaching from 216
        if (importWhat == null || importWhat === "facultyTeaching")
          await importFacultyTeaching(uniqueDg216, facultyRepo, teachingRepo);
        // thesis and only thesis (we simply do not care about the projects here)
        if (importWhat == null || importWhat === "thesisData")
          await importStudentFacultyThesisData(studentRepo, facultyRepo);
        // senior project data
        if (importWhat == null || importWhat === "seniorProject") {
          const apiURL = process.env.SENIOR_PROJECT_API_URL || null;
          if (apiURL !== null) {
            await importSeniorProjectDataFromAPI(
              studentRepo,
              facultyRepo,
              apiURL,
            );
          }
        }
        if (importWhat == null || importWhat === "indivData")
          await importIndividualStudyData(studentRepo, facultyRepo);
        // Research database type
        if (importWhat == null || importWhat === "databaseType")
          await importDatabaseTypeData();
        // Research data
        if (importWhat == null || importWhat === "research") {
          await importResearchData();
        }
        // ResearchAuthor data
        if (importWhat == null || importWhat === "researchAuthor") {
          await importResearchAuthorData(facultyRepo, researchRepo);
        }

        // activity
        if (importWhat == null || importWhat === "activity") {
          await importActivityData();
        }
        // activity faculty
        if (importWhat == null || importWhat === "activityFaculty") {
          await ActivityFaculty.getRepository().clear();
          await importActivityFacultyData(facultyRepo, activityRepo);
        }
        if (importWhat == null || importWhat === "academicWorks") {
          await importAcademicWorks();
        }
        // metadata (should always be last!!!) aka. tell db that the data has already been properly imported so it doesn't duplicate
        {
          console.log("Setting flags...");
          const data = new Metadata();
          data.configName = "courseCached";
          data.data = "true";
          await data.save();
        }
        console.log(`Sample Data has been added to the database succesfully.`);
      } else {
        if (isThisThingCached) {
          console.log(`Sample Data has already been added to the database.`);
        } else console.log(`Sample Data not found. Skipping...`);
      }
      FacultyDataSource.destroy();
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

async function resetAndCreateData() {
  const rawConnection = await mysql.createConnection({
    host: dbaddress,
    user: dbusername,
    password: dbpass,
  });
  const importWhat = process.argv[2];
  console.log(importWhat);
  if (importWhat === null || importWhat === undefined) {
    await rawConnection.execute("drop database facultywork;");
    await rawConnection.execute("create database facultywork;");
  } else {
    /*
    await rawConnection.execute("select database facultywork;");
    switch (importWhat) {
      case "course":
        await rawConnection.execute("drop table course;");
        break;
      case "facultydata":
        await rawConnection.execute("drop table faculty;");
        break;
      case "studentmajor":
        await rawConnection.execute("drop table student;");
        break;
      case "advisor":
        await rawConnection.execute("drop table student_advisor;");
        break;
      case "timetable":
        await rawConnection.execute("drop table timetable;");
        break;
      case "teaching":
        await rawConnection.execute("drop table facultywork;");
        break;
      case "timetableFaculty":
        await rawConnection.execute("drop table facultywork;");
        break;
      case "facultyTeaching":
        await rawConnection.execute("drop table facultywork;");
        break;
      case "seniorProject":
        await rawConnection.execute("drop table facultywork;");
        break;
      case "thesisstudentdata":
        await rawConnection.execute("drop table facultywork;");
        break;
      case "activity":
        await rawConnection.execute("drop table facultywork;");
        break;
    }*/
  }
}

resetAndCreateData().then(() => initializeData());
