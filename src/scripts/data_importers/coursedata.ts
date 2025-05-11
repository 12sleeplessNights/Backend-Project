import { Repository } from "typeorm";
import { JSON, readCSVNoChecks } from "../../utils/utils";
import { Course } from "../../models/objects/course";

export async function importCourseData(courseRepo: Repository<Course>) {
  const cparsed: { [k: string]: string }[] =
    readCSVNoChecks("CourseDataFromDG");
  console.log("Adding Course Data...");

  for await (const rLoop of cparsed) {
    //print(rLoop);
    const record = new Course();
    if (!rLoop.COURSECODE.startsWith("2301")) {
      continue;
    }
    record.courseId = rLoop.COURSECODE;
    record.courseTitle = rLoop.COURSENAME;
    record.courseType = rLoop.TEACHTYPE;
    record.creditLect = parseFloat(rLoop.LECTURECREDIT);
    record.creditNonLect = parseFloat(rLoop.NONLECTURECREDIT);
    record.creditTotal = parseFloat(rLoop.TOTALCREDIT);
    await courseRepo.save(record);
  }
}

export async function importIncrementCourseData(
  courseRepo: Repository<Course>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  const cparsed: { [k: string]: string }[] = readCSVNoChecks(
    "CourseDataFromDG",
    "increment_data",
  );
  console.log("[I] Adding Course Data...");

  for await (const rLoop of cparsed) {
    //print(rLoop);
    const record = new Course();
    if (!rLoop.courseId.startsWith("2301")) {
      continue;
    }
    record.courseId = rLoop.courseId;
    record.courseTitle = rLoop.courseTitle;
    record.courseType = rLoop.courseType;
    record.creditLect = parseFloat(rLoop.creditLect);
    record.creditNonLect = parseFloat(rLoop.creditNonLect);
    record.creditTotal = parseFloat(rLoop.creditTotal);
    if (!dataCache["Course"]) {
      dataCache["Course"] = [];
    }
    dataCache["Course"].push(record);
  }
}
