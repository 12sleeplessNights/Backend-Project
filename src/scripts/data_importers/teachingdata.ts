import { And, Equal, In, Not, Repository } from "typeorm";
import {
  JSON,
  readCSVNoChecks,
  forbiddenClassType,
  forbiddenCourseCode,
} from "../../utils/utils";
import { Course } from "../../models/objects/course";
import { Teaching } from "../../models/teachings/teaching";

export async function importTeachingData(
  courseRepo: Repository<Course>,
  teachingRepo: Repository<Teaching>,
  dg206: JSON[],
) {
  console.log("Adding Teaching Data...");
  const uniqueDg206 = dg206.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.COURSECODE === value.COURSECODE &&
          t.SEMESTER === value.SEMESTER &&
          t.YEAR === value.YEAR &&
          t.SECTION === value.SECTION,
      ),
  );

  const combinedTimetableCSV: { [k: string]: string }[] = readCSVNoChecks(
    "CombinedTimetableSD",
  );
  {
    for (const uniqueEntryOfDG206DoNotUseRowSeq of uniqueDg206) {
      const courseFromRepo = await courseRepo.findOne({
        where: {
          courseId: And(
            Equal(uniqueEntryOfDG206DoNotUseRowSeq.COURSECODE),
            Not(In(forbiddenCourseCode)),
          ),
          courseType: Not(In(forbiddenClassType)),
        },
      });

      if (courseFromRepo != null) {
        const facultyTeachingDataFromDG206 = dg206.filter((v2: JSON) => {
          return (
            uniqueEntryOfDG206DoNotUseRowSeq.COURSECODE === v2.COURSECODE &&
            uniqueEntryOfDG206DoNotUseRowSeq.SEMESTER === v2.SEMESTER &&
            uniqueEntryOfDG206DoNotUseRowSeq.YEAR === v2.YEAR &&
            uniqueEntryOfDG206DoNotUseRowSeq.SECTION === v2.SECTION
          );
        });
        if (facultyTeachingDataFromDG206.length > 0) {
          //console.log(fc);
          // this is for each row_seq value

          const tc = new Teaching();
          // subject data from combined timetable (this is only really for coursetype)
          const subjectAtTheTime = combinedTimetableCSV.filter((v3: JSON) => {
            // the format that is in the file is weird so we do a little trolling and add the first 3 by 1857 because
            // data comes in like 1672 for 2024 (2567 B.E.) semester 2 so we take the first
            // 3 letter and add it to 1857 so 167 + 1857 = 2024 and last is semester
            const year = 1857 + parseInt(v3.term.slice(0, -1)) + "";
            const semester = v3.term.slice(-1);

            return (
              uniqueEntryOfDG206DoNotUseRowSeq.COURSE_CODE === v3.courseId &&
              uniqueEntryOfDG206DoNotUseRowSeq.SEMESTER === semester &&
              uniqueEntryOfDG206DoNotUseRowSeq.YEAR === year &&
              uniqueEntryOfDG206DoNotUseRowSeq.SECTION === v3.section
            );
          });
          tc.courseId = courseFromRepo.courseId;
          tc.section = uniqueEntryOfDG206DoNotUseRowSeq.SECTION;
          tc.year = parseInt(uniqueEntryOfDG206DoNotUseRowSeq.YEAR);
          tc.term = parseInt(uniqueEntryOfDG206DoNotUseRowSeq.SEMESTER);
          tc.termType =
            subjectAtTheTime.length > 0
              ? parseInt(subjectAtTheTime[0].inter)
              : 1;
          tc.enrollStudents = parseInt(
            uniqueEntryOfDG206DoNotUseRowSeq.REALREG,
          );
          tc.maxStudents = parseInt(uniqueEntryOfDG206DoNotUseRowSeq.TOTALREG);
          tc.remarks = `${uniqueEntryOfDG206DoNotUseRowSeq.REMARK1}|${uniqueEntryOfDG206DoNotUseRowSeq.REMARK2}|${uniqueEntryOfDG206DoNotUseRowSeq.REMARK3}`;
          tc.course = courseFromRepo;
          await teachingRepo.save(tc);
        }
      }
    }
  }
}

export async function importIncrementTeachingData(
  courseRepo: Repository<Course>,
  teachingRepo: Repository<Teaching>,
  dg206: JSON[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  console.log("[I] Adding Teaching Data...");
  const uniqueDg206 = dg206.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.COURSECODE === value.COURSECODE &&
          t.SEMESTER === value.SEMESTER &&
          t.YEAR === value.YEAR &&
          t.SECTION === value.SECTION,
      ),
  );

  const combinedTimetableCSV: { [k: string]: string }[] = readCSVNoChecks(
    "CombinedTimetableSD",
    "increment_data",
  );
  {
    for (const uniqueEntryOfDG206DoNotUseRowSeq of uniqueDg206) {
      const courseFromRepo = await courseRepo.findOne({
        where: {
          courseId: uniqueEntryOfDG206DoNotUseRowSeq.COURSECODE,
        },
      });

      if (courseFromRepo != null) {
        const facultyTeachingDataFromDG206 = dg206.filter((v2: JSON) => {
          return (
            uniqueEntryOfDG206DoNotUseRowSeq.COURSECODE === v2.COURSECODE &&
            uniqueEntryOfDG206DoNotUseRowSeq.SEMESTER === v2.SEMESTER &&
            uniqueEntryOfDG206DoNotUseRowSeq.YEAR === v2.YEAR &&
            uniqueEntryOfDG206DoNotUseRowSeq.SECTION === v2.SECTION
          );
        });
        if (facultyTeachingDataFromDG206.length > 0) {
          //console.log(fc);
          // this is for each row_seq value

          const tc = new Teaching();
          // subject data from combined timetable (this is only really for coursetype)
          const subjectAtTheTime = combinedTimetableCSV.filter((v3: JSON) => {
            // the format that is in the file is weird so we do a little trolling and add the first 3 by 1857 because
            // data comes in like 1672 for 2024 (2567 B.E.) semester 2 so we take the first
            // 3 letter and add it to 1857 so 167 + 1857 = 2024 and last is semester
            const year = 1857 + parseInt(v3.term.slice(0, -1)) + "";
            const semester = v3.term.slice(-1);

            return (
              uniqueEntryOfDG206DoNotUseRowSeq.COURSE_CODE === v3.courseId &&
              uniqueEntryOfDG206DoNotUseRowSeq.SEMESTER === semester &&
              uniqueEntryOfDG206DoNotUseRowSeq.YEAR === year &&
              uniqueEntryOfDG206DoNotUseRowSeq.SECTION === v3.section
            );
          });
          tc.courseId = courseFromRepo.courseId;
          tc.section = uniqueEntryOfDG206DoNotUseRowSeq.SECTION;
          tc.year = parseInt(uniqueEntryOfDG206DoNotUseRowSeq.YEAR);
          tc.term = parseInt(uniqueEntryOfDG206DoNotUseRowSeq.SEMESTER);
          tc.termType =
            subjectAtTheTime.length > 0
              ? parseInt(subjectAtTheTime[0].inter)
              : 1;
          tc.enrollStudents = parseInt(
            uniqueEntryOfDG206DoNotUseRowSeq.REALREG,
          );
          tc.maxStudents = parseInt(uniqueEntryOfDG206DoNotUseRowSeq.TOTALREG);
          tc.remarks = `${uniqueEntryOfDG206DoNotUseRowSeq.REMARK1}|${uniqueEntryOfDG206DoNotUseRowSeq.REMARK2}|${uniqueEntryOfDG206DoNotUseRowSeq.REMARK3}`;
          tc.course = courseFromRepo;
          if (!dataCache["Teaching"]) {
            dataCache["Teaching"] = [];
          }
          dataCache["Teaching"].push(tc);
        }
      }
    }
  }
}
