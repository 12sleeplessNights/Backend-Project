import { Request, Response } from "express";
import { FacultyDataSource } from "../utils/db";
import { StudentAdvisor } from "../models/objects/studentAdvisor";

export async function GETstudentDevelopment(req: Request, res: Response) {
  let facultyRel;
  // the queries submitted are advisorID | advisor_name | student_name | year_level
  if (req.query && req.query.advisorID) {
    const advisorID = req.query.advisorID.toString();
    facultyRel = await FacultyDataSource.getRepository(StudentAdvisor).find({
      where: { facultyId: advisorID },
      relations: {
        faculty: true,
        student: true,
      },
    });
  } else {
    facultyRel = await FacultyDataSource.getRepository(StudentAdvisor).find({
      relations: {
        faculty: true,
        student: true,
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const returnData: any[] = [];
  const uniqueFacultyRel = facultyRel.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.facultyId === value.facultyId),
  );
  uniqueFacultyRel.forEach((val) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const va: { [k: string]: any } = {};
    va["id"] = val.facultyId;
    va["advisorName"] =
      val.faculty.engFirstName + " " + val.faculty.engLastName;
    const currentFaculty = facultyRel.filter((v) => {
      return v.faculty.facultyId == val.facultyId;
    });
    va["numberOfStudents"] = currentFaculty.length;
    va["studentList"] = currentFaculty.map((v) => {
      return {
        studentId: v.studentId,
        studentName: v.student.studentName,
        startDate: v.startDate,
        endDate: v.endDate,
      };
    });
    returnData.push(va);
  });

  res.status(200).json(returnData);
  return;
}
