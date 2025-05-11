import { Repository } from "typeorm";
import { Student } from "../../models/objects/student";
import {
  getCurriculum,
  JSON,
  planNumberFromString,
  readCSVNoChecks,
  statusNumberFromString,
} from "../../utils/utils";

export async function importStudentMajorData(studentRepo: Repository<Student>) {
  const sparsed: JSON[] = readCSVNoChecks("StudentMajor");

  console.log("Adding Student Data...");

  const thesisTopics: JSON[] = readCSVNoChecks("ThesisTopics");
  const studentAdvisorData: JSON[] = readCSVNoChecks("StudentAdvisorData");
  for await (const rLoop of sparsed) {
    const rl = rLoop as JSON;
    const studentBachelor = studentAdvisorData.filter(
      (v) => v.studentId == rl.STUDENTCODE,
    );
    const studentNameMasPhD = thesisTopics.filter(
      (v) => v.studentID == rl.STUDENTCODE,
    );
    const isBachelor = studentBachelor.length > 0;
    const student = isBachelor ? studentBachelor[0] : studentNameMasPhD[0];
    //console.log(name);
    // level of edu
    const s = new Student();
    s.studentId = rLoop.STUDENTCODE;
    s.studentName = student != undefined ? student.studentName : "???";
    s.enrollYear = parseInt(rLoop.STARTACADYEAR);
    s.enrollTerm = parseInt(rLoop.STARTSEMESTER);
    s.status =
      student != null
        ? statusNumberFromString(
            isBachelor
              ? student.remarks == ""
                ? "ปกติ"
                : student.remarks.trim()
              : student.Status,
          )
        : -1;
    s.curriculum = getCurriculum(
      parseInt(rLoop.MAJORCODE),
      parseInt(rLoop.PROGRAM),
    );
    s.plan =
      isBachelor || !(student != null)
        ? null!
        : planNumberFromString(student.Plan);
    s.remarks = "";

    await studentRepo.save(s);
  }
}

export async function importIncrementStudentMajorData(
  studentRepo: Repository<Student>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  const sparsed: JSON[] = readCSVNoChecks("StudentMajor", "increment_data");

  console.log("[I] Adding Student Data...");

  const thesisTopics: JSON[] = readCSVNoChecks("ThesisTopics");
  const studentAdvisorData: JSON[] = readCSVNoChecks("StudentAdvisorData");
  for await (const rLoop of sparsed) {
    const rl = rLoop as JSON;
    const studentBachelor = studentAdvisorData.filter(
      (v) => v.studentId == rl.STUDENTCODE,
    );
    const studentNameMasPhD = thesisTopics.filter(
      (v) => v.studentID == rl.STUDENTCODE,
    );
    const isBachelor = studentBachelor.length > 0;
    const student = isBachelor ? studentBachelor[0] : studentNameMasPhD[0];
    //console.log(name);
    // level of edu
    const s = new Student();
    s.studentId = rLoop.STUDENTCODE;
    s.studentName = student != undefined ? student.studentName : "???";
    s.enrollYear = parseInt(rLoop.STARTACADYEAR);
    s.enrollTerm = parseInt(rLoop.STARTSEMESTER);
    s.status =
      student != null
        ? statusNumberFromString(
            isBachelor
              ? student.remarks == ""
                ? "ปกติ"
                : student.remarks.trim()
              : student.Status,
          )
        : -1;
    s.curriculum = getCurriculum(
      parseInt(rLoop.MAJORCODE),
      parseInt(rLoop.PROGRAM),
    );
    s.plan =
      isBachelor || !(student != null)
        ? null!
        : planNumberFromString(student.Plan);
    s.remarks = "";
    if (!dataCache["Student"]) {
      dataCache["Student"] = [];
    }
    dataCache["Student"].push(s);
  }
}
