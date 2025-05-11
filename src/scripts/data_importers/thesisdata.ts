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
} from "../../utils/utils";
import { Faculty } from "../../models/objects/faculty";

export async function importStudentFacultyThesisData(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
) {
  console.log("Adding Thesis Data...");
  const thesisTopics: JSON[] = readCSVNoChecks("ThesisTopics");
  const dg101: JSON[] = readCSVNoChecks("DG0101-NoNID");
  const uniqueDg101 = dg101.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.STUDENT_ID === value.STUDENT_ID),
  );
  const thadparsed: JSON[] = readCSVNoChecks("ThesisAdvisors");
  for await (const eachinuniquedg101 of uniqueDg101) {
    const dg101ofCurrent = dg101.filter((v) => {
      return v.STUDENT_ID == eachinuniquedg101.STUDENT_ID;
    });
    //console.log(eachinuniquedg101.STUDENT_ID);
    const uniqueThesisTopics = thesisTopics.filter(
      (value, index, self) =>
        index ===
        self.findIndex((t) => t.studentID === eachinuniquedg101.STUDENT_ID),
    );
    const thesis_advisor_with_this_student_id = thadparsed.filter((v) => {
      return v.StudentID == eachinuniquedg101.STUDENT_ID;
    });
    let student = await studentRepo.findOne({
      where: {
        studentId: eachinuniquedg101.STUDENT_ID,
      },
    });
    //console.log(student);
    const th = new ProjectThesis();
    if (student != null && thesis_advisor_with_this_student_id.length > 0) {
      // do something
    }
    //Student may not have in dg files so we need to get in thesis topics
    else {
      student = new Student();
      student.studentId = eachinuniquedg101.STUDENT_ID;
      student.studentName = eachinuniquedg101.STUDENT_NAME_TH;
      if (
        uniqueThesisTopics.length > 0 &&
        uniqueThesisTopics[0].EnrollYear != undefined
      ) {
        student.enrollYear = parseInt(uniqueThesisTopics[0].EnrollYear);
      }
      if (
        uniqueThesisTopics.length > 0 &&
        uniqueThesisTopics[0].EnrollTerm != undefined
      ) {
        student.enrollTerm = parseInt(uniqueThesisTopics[0].EnrollTerm);
      }
      if (
        uniqueThesisTopics.length > 0 &&
        uniqueThesisTopics[0].Status != undefined &&
        uniqueThesisTopics[0].Status != null
      ) {
        student.status =
          statusNumberFromString(
            thesis_advisor_with_this_student_id[0]!.Status!,
          ) ?? undefined;
      }
      if (
        thesis_advisor_with_this_student_id.length > 0 &&
        thesis_advisor_with_this_student_id[0].Curriculum != undefined &&
        thesis_advisor_with_this_student_id[0].Curriculum != null
      ) {
        student.curriculum = curriculumNumberFromString(
          thesis_advisor_with_this_student_id[0]!.Curriculum!,
        );
      }
      if (
        thesis_advisor_with_this_student_id.length > 0 &&
        thesis_advisor_with_this_student_id[0].Plan != undefined &&
        thesis_advisor_with_this_student_id[0].Plan != null
      ) {
        student.plan = planNumberFromString(
          thesis_advisor_with_this_student_id[0]!.Plan!,
        );
      }
      if (
        uniqueThesisTopics.length > 0 &&
        uniqueThesisTopics[0].Remarks != undefined
      ) {
        student.remarks = nuller(uniqueThesisTopics[0].Remarks);
      }
      await studentRepo.save(student);
    }
    //console.log(student.studentId);
    //console.log(student.plan);
    //console.log(student.curriculum);
    if (student.plan != null && student.curriculum != null) {
      th.courseId = courseIdToString(student.plan, student.curriculum);
    }
    th.engTopic = nuller(
      san(eachinuniquedg101.THESIS_TITLE_EN) ||
        uniqueThesisTopics[0]["English Topic"],
    );
    th.thTopic = nuller(
      san(eachinuniquedg101.THESIS_TITLE_TH) ||
        uniqueThesisTopics[0]["หัวข้อภาษาไทย"],
    );
    //console.log(thesis_advisor_with_this_student_id[0]);
    //console.log(uniqueThesisTopics[0]);
    th.projectStatus = uniqueThesisTopics[0]?.["Status"] ?? null;
    th.advisorAssignmentDate = uniqueThesisTopics[0]?.["Assignment"] ?? null;
    th.proposalDate = nuller(uniqueThesisTopics[0]?.["Proposal Date"]) ?? null;
    th.defenseDate = nuller(uniqueThesisTopics[0]?.["Defense Date"]) ?? null;
    th.remarks = uniqueThesisTopics[0]?.["Remarks"] ?? null;
    await th.save();
    /*const student = await studentRepo.findOne({
              where: {
                studentId: a.studentID,
              },
            });*/
    if (student != null) {
      const studentThesis = new ProjectThesisStudent();
      studentThesis.student = student;
      studentThesis.projectThesis = th;
      await studentThesis.save();
      th.projectThesisStudent = [studentThesis];
    }
    const allowedRole = ["advisor", "co_advisor", "examiner"];
    for await (const eachDG101 of dg101ofCurrent) {
      const [firstName, lastName] = eachDG101.ADVISOR_NAME_TH.split(" ");
      const faculty = await facultyRepo.findOne({
        where: {
          thaiFirstName: firstName,
          thaiLastName: lastName,
        },
      });
      if (faculty != null && allowedRole.includes(eachDG101.ADVISOR_POSITION)) {
        const thesisFaculty = new ProjectThesisFaculty();
        thesisFaculty.faculty = faculty;
        thesisFaculty.projectThesis = th;
        thesisFaculty.role = roleNumberFromString(eachDG101.ADVISOR_POSITION);
        thesisFaculty.yearStart =
          !isNaN(
            parseInt(thesis_advisor_with_this_student_id[0]?.YearStart ?? ""),
          ) && thesis_advisor_with_this_student_id[0]?.YearStart?.trim() !== ""
            ? parseInt(thesis_advisor_with_this_student_id[0]?.YearStart ?? "")
            : null!;
        thesisFaculty.termStart =
          !isNaN(
            parseInt(thesis_advisor_with_this_student_id[0]?.TermStart ?? ""),
          ) && thesis_advisor_with_this_student_id[0]?.TermStart?.trim() !== ""
            ? parseInt(thesis_advisor_with_this_student_id[0]?.TermStart ?? "")
            : null!;
        thesisFaculty.maxTermCount =
          !isNaN(
            parseInt(
              thesis_advisor_with_this_student_id[0]?.CalculatedMaxTermCount ??
                "",
            ),
          ) &&
          thesis_advisor_with_this_student_id[0]?.CalculatedMaxTermCount?.trim() !==
            ""
            ? parseInt(
                thesis_advisor_with_this_student_id[0]
                  ?.CalculatedMaxTermCount ?? "",
              )
            : null!;
        await thesisFaculty.save();
      }
    }
  }
  // thesis advisor
}
/*
export async function importIncrementStudentFacultyThesisData(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  console.log("[I] Adding Thesis Data...");
  const thesisTopics: JSON[] = readCSVNoChecks("ThesisTopics");
  const dg101: JSON[] = readCSVNoChecks("DG0101-NoNID", "increment_data");
  const uniqueDg101 = dg101.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.STUDENT_ID === value.STUDENT_ID),
  );
  const thadparsed: JSON[] = readCSVNoChecks("ThesisAdvisors");
  for await (const eachinuniquedg101 of uniqueDg101) {
    const dg101ofCurrent = dg101.filter((v) => {
      return v.STUDENT_ID == eachinuniquedg101.STUDENT_ID;
    });
    const uniqueThesisTopics = thesisTopics.filter(
      (value, index, self) =>
        index ===
        self.findIndex((t) => t.studentID === eachinuniquedg101.STUDENT_ID),
    );
    const thesis_advisor_with_this_student_id = thadparsed.filter((v) => {
      return v.StudentID == eachinuniquedg101.STUDENT_ID;
    });
    let student = await studentRepo.findOne({
      where: {
        studentId: eachinuniquedg101.studentID,
      },
    });
    const th = new ProjectThesis();
    if (student != null) {
      // do something
    }
    //Student may not have in dg files so we need to get in thesis topics
    else {
      student = new Student();
      student.studentId = IFNULL(
        thesis_advisor_with_this_student_id,
        thesis_advisor_with_this_student_id[0].studentID,
      );
      student.studentName = IFNULL(
        thesis_advisor_with_this_student_id,
        thesis_advisor_with_this_student_id[0].studentName,
      );
      student.enrollYear = IFNULL(
        uniqueThesisTopics,
        parseInt(uniqueThesisTopics[0].EnrollYear),
      );
      student.enrollTerm = IFNULL(
        uniqueThesisTopics,
        parseInt(uniqueThesisTopics[0].EnrollTerm),
      );
      student.status = statusNumberFromString(
        thesis_advisor_with_this_student_id[0].Status,
      );
      student.curriculum = curriculumNumberFromString(
        thesis_advisor_with_this_student_id[0].Curriculum,
      );
      student.plan = planNumberFromString(
        thesis_advisor_with_this_student_id[0].Plan,
      );
      student.remarks = nuller(uniqueThesisTopics[0].Remarks);
      if (!dataCache["Student"]) {
        dataCache["Student"] = [];
      }
      dataCache["Student"].push(student);
    }

    th.courseId = courseIdToString(student.plan, student.curriculum);
    th.engTopic = nuller(
      san(eachinuniquedg101.THESIS_TITLE_EN) ||
        uniqueThesisTopics[0]["English Topic"],
    );
    th.thTopic = nuller(
      san(eachinuniquedg101.THESIS_TITLE_TH) ||
        uniqueThesisTopics[0]["หัวข้อภาษาไทย"],
    );
    //console.log(thesis_advisor_with_this_student_id[0]);
    //console.log(uniqueThesisTopics[0]);
    th.projectStatus = nuller(uniqueThesisTopics[0]["Status"]);
    th.advisorAssignmentDate = nuller(
      uniqueThesisTopics[0]["Advisor Assignment Date"],
    );
    th.proposalDate = nuller(uniqueThesisTopics[0]["Proposal Date"])!;
    th.defenseDate =
      uniqueThesisTopics[0]["Defense Date"] == ""
        ? null
        : nuller(uniqueThesisTopics[0]["Defense Date"])!;
    th.remarks = nuller(uniqueThesisTopics[0]["Remarks"])!;
    if (!dataCache["ProjectThesis"]) {
      dataCache["ProjectThesis"] = [];
    }
    dataCache["ProjectThesis"].push(th);
    /*const student = await studentRepo.findOne({
              where: {
                studentId: a.studentID,
              },
            }); 
    if (student != null) {
      const studentThesis = new ProjectThesisStudent();
      studentThesis.student = student;
      studentThesis.projectThesis = th;
      if (!dataCache["ProjectThesisStudent"]) {
        dataCache["ProjectThesisStudent"] = [];
      }
      dataCache["ProjectThesisStudent"].push(studentThesis);
      th.projectThesisStudent = [studentThesis];
    }
    const allowedRole = ["advisor", "co_advisor", "examiner"];
    for await (const eachDG101 of dg101ofCurrent) {
      const [firstName, lastName] = eachDG101.ADVISOR_NAME_TH.split(" ");
      const faculty = await facultyRepo.findOne({
        where: {
          thaiFirstName: firstName,
          thaiLastName: lastName,
        },
      });
      if (faculty != null && allowedRole.includes(eachDG101.ADVISOR_POSITION)) {
        const thesisFaculty = new ProjectThesisFaculty();
        thesisFaculty.faculty = faculty;
        thesisFaculty.projectThesis = th;
        thesisFaculty.role = roleNumberFromString(eachDG101.ADVISOR_POSITION);
        thesisFaculty.yearStart =
          thesis_advisor_with_this_student_id[0].YearStart?.trim() !== "" &&
          !isNaN(parseInt(eachDG101.YearStart))
            ? parseInt(thesis_advisor_with_this_student_id[0].YearStart ?? "")
            : null!;
        thesisFaculty.termStart =
          thesis_advisor_with_this_student_id[0].TermStart?.trim() !== ""
            ? parseInt(thesis_advisor_with_this_student_id[0].TermStart ?? "")
            : null!;
        thesisFaculty.maxTermCount =
          thesis_advisor_with_this_student_id[0].MaxTermCount?.trim() !== ""
            ? parseInt(
                thesis_advisor_with_this_student_id[0].MaxTermCount ?? "",
              )
            : null!;
        if (!dataCache["ProjectThesisFaculty"]) {
          dataCache["ProjectThesisFaculty"] = [];
        }
        dataCache["ProjectThesisFaculty"].push(thesisFaculty);
        await thesisFaculty.save();
      }
    }
  }
  // thesis advisor
}
*/
