import { Repository } from "typeorm";
import { Student } from "../../models/objects/student";
import { ProjectThesis } from "../../models/teachings/projectThesis";
import { ProjectThesisFaculty } from "../../models/teachings/projectThesisFaculty";
import { ProjectThesisStudent } from "../../models/teachings/projectThesisStudent";

import {
  readCSVNoChecks,
  statusNumberFromString,
  curriculumNumberFromString,
  planNumberFromString,
  nuller,
  courseIdToString,
  roleNumberFromString,
  JSON,
  san,
  IFNULL,
  NUNU,
  scramNAN,
} from "../../utils/utils";
import { Faculty } from "../../models/objects/faculty";

export async function importIndividualStudyData(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
) {
  console.log("Adding Indiv Data...");
  const indiv: JSON[] = readCSVNoChecks("Indivstudy");
  const dg216: JSON[] = readCSVNoChecks("DG0216");

  for await (const i of indiv) {
    const student = await studentRepo.findOne({
      where: {
        studentId: i.REMARK1,
      },
    });
    const th = new ProjectThesis();
    th.courseId = i.COURSE_CODE;
    await th.save();

    if (student != null) {
      const studentThesis = new ProjectThesisStudent();
      studentThesis.student = student;
      studentThesis.projectThesis = th;
      await studentThesis.save();
      th.projectThesisStudent = [studentThesis];
    }

    const indivFac = dg216.filter((row: JSON) => {
      return (
        i.COURSE_CODE === row.COURSE_CODE &&
        i.YEAR === row.ACAD_YEAR &&
        i.SEMESTER === row.SEMESTER &&
        i.SECTION === row.SECTION
      );
    });

    for await (const eachindivFac of indivFac) {
      const faculty = await facultyRepo.findOne({
        where: {
          abbrev: eachindivFac.NAME_ABBR,
        },
      });
      if (faculty != null) {
        const thesisFaculty = new ProjectThesisFaculty();
        thesisFaculty.faculty = faculty;
        thesisFaculty.projectThesis = th;
        thesisFaculty.role = 1;
        thesisFaculty.yearStart = parseInt(i.YEAR);
        thesisFaculty.termStart = parseInt(i.SEMESTER);
        await thesisFaculty.save();
      }
    }
  }
  // thesis advisor
}
