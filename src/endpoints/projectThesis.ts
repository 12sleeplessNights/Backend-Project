import { Request, Response } from "express";
import { ProjectThesis } from "../models/teachings/projectThesis";
import { FacultyDataSource } from "../utils/db";
import { FRCS } from "../utils/utils";
import { Like } from "typeorm";
import { Course } from "../models/objects/course";

export async function GETprojectAdvisor(req: Request, res: Response) {
  // they give advisorID | advisor_name | student_name | year_level but we will only care about req.params.advisorID for now
  // if (!req.query || !req.query.advisorID) {
  //   res.status(400).send("Missing params " + JSON.stringify(req.query));
  //   return;
  // }
  //const advisorID = req.query.advisorID.toString();
  const professor_name = req.query.professor_name || null;
  const project_name = req.query.project_name || null;
  const student_name = req.query.student_name || null;
  const year = req.query.year ? parseInt(req.query.year.toString()) : undefined;
  const advisorNameQuery = `%${FRCS(professor_name)}%`;
  const projectNameQuery = `%${FRCS(project_name)}%`;
  const studentNameQuery = `%${FRCS(student_name)}%`;
  const projectThesis = await FacultyDataSource.getRepository(
    ProjectThesis,
  ).find({
    where: [
      {
        projYear: year,
        projectThesisFaculty: {
          faculty: {
            fullName: professor_name ? Like(advisorNameQuery) : undefined,
          },
        },
        projectThesisStudent: {
          student: {
            studentName: project_name ? Like(studentNameQuery) : undefined,
          },
        },
        thTopic: project_name ? Like(projectNameQuery) : undefined,
      },
      {
        projYear: year,
        projectThesisFaculty: {
          faculty: {
            fullThaiName: professor_name ? Like(advisorNameQuery) : undefined,
          },
        },
        projectThesisStudent: {
          student: {
            studentName: project_name ? Like(studentNameQuery) : undefined,
          },
        },
        thTopic: project_name ? Like(projectNameQuery) : undefined,
      },
      {
        projYear: year,
        projectThesisFaculty: {
          faculty: {
            fullName: professor_name ? Like(advisorNameQuery) : undefined,
          },
        },
        projectThesisStudent: {
          student: {
            studentName: project_name ? Like(studentNameQuery) : undefined,
          },
        },
        engTopic: project_name ? Like(projectNameQuery) : undefined,
      },
      {
        projYear: year,
        projectThesisFaculty: {
          faculty: {
            fullThaiName: professor_name ? Like(advisorNameQuery) : undefined,
          },
        },
        projectThesisStudent: {
          student: {
            studentName: project_name ? Like(studentNameQuery) : undefined,
          },
        },
        engTopic: project_name ? Like(projectNameQuery) : undefined,
      },
    ],
    relations: {
      projectThesisFaculty: {
        faculty: true,
      },
      projectThesisStudent: {
        student: true,
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const returnData: any[] = [];
  for await (const val of projectThesis) {
    // eslint-disable-next-line no-constant-condition
    if (val.courseId === "2301399" || val.courseId === "2301499" || true) {
      const c = await Course.getRepository().findOne({
        where: {
          courseId: val.courseId ?? "0000000",
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const va: { [k: string]: any } = {};
      va["id"] = val.projectThesisId;
      va["courseName"] = c?.courseTitle ?? "??";
      va["courseType"] = val.courseId ?? "??";
      va["projectNameThai"] = val.thTopic;
      va["projectNameEng"] = val.engTopic;
      va["projectAdvisor"] = "";
      va["projectMember"] = "";
      //console.log(val);
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
  }
  res.status(200).json(returnData);
  return;
}
