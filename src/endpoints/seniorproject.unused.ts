import { Request, Response } from "express";
import { And, In, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
import { ProjectThesis } from "../models/teachings/projectThesis";

export async function GETResearchData(req: Request, res: Response) {
  const project_name =
    req.query.project_name != null
      ? Like(`%${req.query.project_name}%`)
      : undefined;
  const project_status =
    req.query.project_status != null
      ? req.query.project_status.toString()
      : undefined;
  const professor_name = req.query.professor_name?.toString() || undefined;
  const professor_name_arr =
    professor_name != null
      ? professor_name.split(",").map((v) => {
          return "%" + v + "%";
        })
      : undefined;
  const student_name = req.query.student_name?.toString() || undefined;
  const student_name_arr =
    student_name != null
      ? student_name.split(",").map((v) => {
          return "%" + v + "%";
        })
      : undefined;
  const year =
    req.query.year != null ? parseInt(req.query.year?.toString()) : undefined;
  const projects = await ProjectThesis.getRepository().find({
    where: [
      {
        engTopic: project_name,
        projectThesisFaculty: {
          faculty: {
            fullName:
              professor_name_arr != undefined
                ? Like(In(professor_name_arr))
                : undefined,
          },
        },
        projectThesisStudent: {
          student: {
            studentName:
              student_name_arr != undefined
                ? Like(In(student_name_arr))
                : student_name_arr,
          },
        },
        projectStatus: project_status,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const returnData: any[] = [];
  projects.forEach((val) => {
    if (val.courseId === "2301399" || val.courseId === "2301499") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const va: { [k: string]: any } = {};
      va["id"] = val.projectThesisId;
      va["courseType"] = val.courseId;
      va["projectNameThai"] = val.thTopic;
      va["projectNameEng"] = val.engTopic;
      va["projectAdvisor"] = "";
      va["projectMember"] = "";
      console.log(val);
      val.projectThesisFaculty.forEach((v, i) => {
        va["projectAdvisor"] +=
          (i == 0 ? "" : ",") +
          v.faculty.thaiFirstName +
          " " +
          v.faculty.thaiLastName;
      });
      val.projectThesisStudent.forEach((v, i) => {
        va["projectMember"] += (i == 0 ? "" : ",") + v.student.studentName;
      });

      va["projectStatus"] = val.projectStatus;
      va["projectProposalDate"] = val.proposalDate;
      va["projectDefenseDate"] = val.defenseDate;
      returnData.push(va);
    }
  });
  res.status(200).json(returnData);
}
