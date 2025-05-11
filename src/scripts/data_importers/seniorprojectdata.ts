import { Repository } from "typeorm";
import {
  JSON,
  nuller,
  passSemester,
  readCSVNoChecks,
  splitThaiHonorific,
} from "../../utils/utils";
import { Student } from "../../models/objects/student";
import { ProjectThesis } from "../../models/teachings/projectThesis";
import { ProjectThesisFaculty } from "../../models/teachings/projectThesisFaculty";
import { ProjectThesisStudent } from "../../models/teachings/projectThesisStudent";
import { Faculty } from "../../models/objects/faculty";

export async function importSeniorProjectData(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
) {
  // TODO: Pull from API
  console.log("Adding Senior Project Data...");
  const seniorProjData: JSON[] = readCSVNoChecks("SeniorProjectData");
  for await (const a of seniorProjData) {
    const student1 = await studentRepo.findOne({
      where: {
        studentId: a["สมาชิกโครงงาน 1"].split(" ")[0],
      },
    });
    const student2 =
      a.Member2 != ""
        ? await studentRepo.findOne({
            where: {
              studentId: a["สมาชิกโครงงาน 2"].split(" ")[0],
            },
          })
        : null;
    const prj = new ProjectThesis();

    prj.courseId = a.courseId;
    prj.engTopic = nuller(a["ชื่อโครงงานภาษาอังกฤษ"]);
    prj.thTopic = nuller(a["ชื่อโครงงานภาษาไทย"]);
    prj.projectStatus = null!;
    await prj.save();
    /*const student = await studentRepo.findOne({
        where: {
          studentId: a.studentID,
        },
      });*/
    prj.projectThesisStudent = [];
    if (student1 != null) {
      const studentThesis = new ProjectThesisStudent();
      studentThesis.student = student1;
      studentThesis.projectThesis = prj;
      await studentThesis.save();
      prj.projectThesisStudent.push(studentThesis);
    }
    if (student2 != null) {
      const studentThesis = new ProjectThesisStudent();
      studentThesis.student = student2;
      studentThesis.projectThesis = prj;
      await studentThesis.save();
      prj.projectThesisStudent.push(studentThesis);
    }
    const advisors = [
      [a["อาจารย์ที่ปรึกษาโครงงาน 1"], 1],
      [a["อาจารย์ที่ปรึกษาโครงงาน 2"], 1],
      [a["กรรมการ 1"], 2],
      [a["กรรมการ 2"], 2],
    ];
    for await (const b of advisors) {
      const name = b[0] as string;
      const nameOnly = name.substring(name.lastIndexOf(".") + 1).trim();
      const [firstName, lastName] = nameOnly.split(" ");
      const faculty = await facultyRepo.findOne({
        where: {
          thaiFirstName: firstName,
          thaiLastName: lastName,
        },
      });
      if (faculty != null) {
        const thesisFaculty = new ProjectThesisFaculty();
        thesisFaculty.faculty = faculty;
        thesisFaculty.projectThesis = prj;
        thesisFaculty.role = b[1] as number;
        await thesisFaculty.save();
      }
    }
  }
  // thesis advisor
  console.log("Adding Thesis Advisory Data...");
}

export async function importSeniorProjectDataFromAPI(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
  backendURL: string,
) {
  // TODO: Pull from API
  console.log("Adding Senior Project Data...");
  let type = "proposals";
  let year = 2566;
  let term = 1;
  const CURRENTYEAR = new Date().getFullYear() + 543;
  while (true) {
    const response = await fetch(
      `${backendURL}/seniorprojectapi/${type}?year=${year}&term=${term}`,
    );
    if (
      response.status === 204 &&
      type == "projects" &&
      year >= CURRENTYEAR - 1
    ) {
      if (term == 2) break;
      else {
        const next = passSemester(year, term); //passSemester will pass to new semester and return array of year and term
        year = next[0];
        term = next[1];
        continue;
      }
    } else if (
      response.status === 204 &&
      type == "proposals" &&
      year >= CURRENTYEAR - 1
    ) {
      if (term == 2) {
        type = "projects";
        year = 2566;
        continue;
      } else {
        const next = passSemester(year, term);
        year = next[0];
        term = next[1];
        continue;
      }
    }
    const data = await response.json();
    for (const record of data) {
      // Process each record as needed
      //console.log(record.engTopic, record.student1, record.student2);
      const student1 =
        record.student1 != null
          ? await studentRepo.findOne({
              where: {
                studentName: (() => {
                  if (record.student1 === null) return undefined;
                  const nameObj = splitThaiHonorific(record.student1);
                  return `${nameObj.honorific ?? ""} ${nameObj.firstName ?? ""} ${nameObj.lastName ?? ""}`.trim();
                })(),
              },
            })
          : null;
      const student2 =
        record.student2 != null
          ? await studentRepo.findOne({
              where: {
                studentName: (() => {
                  if (record.student2 === null) return undefined;
                  const nameObj = splitThaiHonorific(record.student2);
                  return `${nameObj.honorific ?? ""} ${nameObj.firstName ?? ""} ${nameObj.lastName ?? ""}`.trim();
                })(),
              },
            })
          : null;
      const prj = new ProjectThesis();
      prj.courseId = type == "proposals" ? "2301399" : "2301499";
      prj.engTopic = nuller(record.projectNameEn);
      prj.thTopic = nuller(record.projectNameTh);
      prj.projYear = nuller(year - 543);
      if (record.pass1 == true) {
        prj.projectStatus = "ดำเนินการเสร็จสิ้น";
      } else if (record.pass1 == false) {
        prj.projectStatus = "ดำเนินการไม่สำเร็จ";
      } else {
        prj.projectStatus = "กำลังดำเนินการ";
      }
      await prj.save();

      prj.projectThesisStudent = [];
      if (student1 != null) {
        const studentThesis = new ProjectThesisStudent();
        studentThesis.student = student1;
        studentThesis.projectThesis = prj;
        await studentThesis.save();
        prj.projectThesisStudent.push(studentThesis);
      }
      if (student2 != null) {
        const studentThesis = new ProjectThesisStudent();
        studentThesis.student = student2;
        studentThesis.projectThesis = prj;
        await studentThesis.save();
        prj.projectThesisStudent.push(studentThesis);
      }
      const advisors = [
        [record.advisor1, 1],
        [record.advisor2, 1],
        [record.committee1, 2],
        [record.committee2, 2],
      ];
      for await (const b of advisors) {
        if (b[0] == null) continue;
        const name = b[0] as string;
        const nameOnly = name.substring(name.lastIndexOf(".") + 1).trim();
        const [firstName, lastName] = nameOnly.split(" ");
        const faculty = await facultyRepo.findOne({
          where: {
            thaiFirstName: firstName,
            thaiLastName: lastName,
          },
        });
        if (faculty != null) {
          const thesisFaculty = new ProjectThesisFaculty();
          thesisFaculty.faculty = faculty;
          thesisFaculty.projectThesis = prj;
          thesisFaculty.role = b[1] as number;
          thesisFaculty.yearStart = year - 543;
          thesisFaculty.termStart = term;
          await thesisFaculty.save();
        }
      }
    }
    const next = passSemester(year, term);
    year = next[0];
    term = next[1];
  }
  // thesis advisor
  //console.log("Adding Thesis Advisory Data...");
}
