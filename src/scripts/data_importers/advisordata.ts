import { Repository } from "typeorm";
import { Faculty } from "../../models/objects/faculty";
import { Student } from "../../models/objects/student";
import { StudentAdvisor } from "../../models/objects/studentAdvisor";
import { JSON, readCSVNoChecks } from "../../utils/utils";

export async function importAdvisorData(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
  studentAdvisorRepo: Repository<StudentAdvisor>,
) {
  console.log("Adding Advisory Data...");
  const advisorparsed: JSON[] = readCSVNoChecks("StudentAdvisorData");
  for await (const rLoop of advisorparsed) {
    const flname = rLoop.advisor.split(" ").slice(-2);
    const faculty = await facultyRepo.findOne({
      where: {
        thaiFirstName: flname[0],
        thaiLastName: flname[1],
      },
    });
    const student = await studentRepo.findOne({
      where: {
        studentId: rLoop.studentId,
      },
    });
    if (student != null && faculty != null) {
      const advisorMeta = new StudentAdvisor();
      advisorMeta.facultyId = faculty.facultyId;
      advisorMeta.studentId = student.studentId;
      advisorMeta.startDate = rLoop.startDate;
      advisorMeta.endDate = null!;
      await studentAdvisorRepo.save(advisorMeta);
    }
  }
}

export async function importIncrementAdvisorData(
  studentRepo: Repository<Student>,
  facultyRepo: Repository<Faculty>,
  studentAdvisorRepo: Repository<StudentAdvisor>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  console.log("[I] Adding Advisory Data...");
  const advisorparsed: JSON[] = readCSVNoChecks(
    "StudentAdvisorData",
    "increment_data",
  );
  for await (const rLoop of advisorparsed) {
    const flname = rLoop.advisor.split(" ").slice(-2);
    const faculty = await facultyRepo.findOne({
      where: {
        thaiFirstName: flname[0],
        thaiLastName: flname[1],
      },
    });
    const student = await studentRepo.findOne({
      where: {
        studentId: rLoop.studentId,
      },
    });
    if (student != null && faculty != null) {
      const advisorMeta = new StudentAdvisor();
      advisorMeta.facultyId = faculty.facultyId;
      advisorMeta.studentId = student.studentId;
      advisorMeta.startDate = rLoop.startDate;
      advisorMeta.endDate = null!;
      if (!dataCache["Advisor"]) {
        dataCache["Advisor"] = [];
      }
      dataCache["Advisor"].push(advisorMeta);
    }
  }
}
