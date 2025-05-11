import { DataSource, Repository } from "typeorm";
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
import { importIncrementCourseData } from "./data_importers/coursedata";
import { importIncrementFacultyData } from "./data_importers/facultydata";
import { importIncrementStudentMajorData } from "./data_importers/studentmajor";
import { importIncrementAdvisorData } from "./data_importers/advisordata";
import { importIncrementTimetableData } from "./data_importers/timetabledata";
import { importIncrementTeachingData } from "./data_importers/teachingdata";
import { importIncrementTimetableTeaching } from "./data_importers/timetableteachingdata";
import { importIncrementFacultyTeaching } from "./data_importers/facultyteaching";
import { importIncrementStudentFacultyThesisData } from "./data_importers/thesisdata";
import { importIncrementActivityData } from "./data_importers/activitydata";
import { importIncrementActivityFacultyData } from "./data_importers/activityFaculty";
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
      const dataToImport = {};
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
        //const researchRepo = FacultyDataSource.getRepository(Research);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataRepoReference: { [k: string]: Repository<any> } = {
          Course: courseRepo,
        };
        if (importWhat == null || importWhat === "course")
          await importIncrementCourseData(courseRepo, dataToImport);
        // faculty data
        if (importWhat == null || importWhat === "facultydata")
          await importIncrementFacultyData(facultyRepo, dataToImport);
        // student major
        if (importWhat == null || importWhat === "studentmajor")
          await importIncrementStudentMajorData(studentRepo, dataToImport);
        // advisor data
        if (importWhat == null || importWhat === "advisor")
          await importIncrementAdvisorData(
            studentRepo,
            facultyRepo,
            studentAdvisorRepo,
            dataToImport,
          );
        // timetable data
        if (importWhat == null || importWhat === "timetable")
          await importIncrementTimetableData(
            dg206,
            timetableRepo,
            dataToImport,
          );
        // teaching
        if (importWhat == null || importWhat === "teaching")
          await importIncrementTeachingData(
            courseRepo,
            teachingRepo,
            dg206,
            dataToImport,
          );
        // time table faculty teaching
        if (importWhat == null || importWhat === "timetableFaculty")
          await importIncrementTimetableTeaching(
            dg206,
            teachingRepo,
            timetableRepo,
            dataToImport,
          );
        // faculty teaching from 216
        if (importWhat == null || importWhat === "facultyTeaching")
          await importIncrementFacultyTeaching(
            uniqueDg216,
            facultyRepo,
            teachingRepo,
            dataToImport,
          );
        // thesis and only thesis (we simply do not care about the projects here)
        if (importWhat == null || importWhat === "thesisData")
          await importIncrementStudentFacultyThesisData(
            studentRepo,
            facultyRepo,
            dataToImport,
          );
        // activity
        if (importWhat == null || importWhat === "activity")
          await importIncrementActivityData(dataToImport);

        // activity faculty
        if (importWhat == null || importWhat === "activityFaculty")
          await importIncrementActivityFacultyData(
            facultyRepo,
            activityRepo,
            dataToImport,
          );

        for (const [key, value] of Object.entries(dataToImport)) {
          if (dataRepoReference[key]) {
            const existingData = await dataRepoReference[key].find();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newData = (value as any[]).filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (item: any) =>
                !existingData.some(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (existingItem: any) =>
                    JSON.stringify(existingItem) === JSON.stringify(item),
                ),
            );
            if (newData.length > 0) {
              await dataRepoReference[key].save(newData);
              console.log(`Added ${newData.length} new entries to ${key}`);
            } else {
              console.log(`No new data to add for ${key}`);
            }
          } else {
            console.log(`No repository found for ${key}`);
          }
        }
        {
          console.log("Setting flags...");
          const data = new Metadata();
          data.configName = "baseImported";
          data.data = "true";
          await data.save();
        }
        console.log(`Prelim. Data has been added to the database succesfully.`);
      } else {
        if (isThisThingCached) {
          console.log(`Prelim. has already been added to the database.`);
        } else console.log(`Sample Data not found. Skipping...`);
      }
      FacultyDataSource.destroy();
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

async function resetAndCreateData() {}

resetAndCreateData().then(() => initializeData());
