import { Request, Response } from "express";
import { FacultyDataSource } from "../utils/db";
import { Timetable } from "../models/teachings/timetable";
import { TeachingTimetable } from "../models/teachings/teachingTimetable";
import { FacultyTeaching } from "../models/teachings/facultyTeaching";
import { ProjectThesis } from "../models/teachings/projectThesis";
import { Research } from "../models/research/research";
import { AcademicWork } from "../models/research/academicWork";
import { Activity } from "../models/activityData/activity";
import { StudentAdvisor } from "../models/objects/studentAdvisor";
import { Faculty } from "../models/objects/faculty";
import { JSON } from "../utils/utils";

export async function GetWorkload(req: Request, res: Response) {
  // they give advisorID | advisor_name | student_name | year_level but we will only care about req.params.advisorID for now
  // if (!req.query || !req.query.advisorID) {
  //   res.status(400).send("Missing params " + JSON.stringify(req.query));
  //   return;
  // }
  //const advisorID = req.query.advisorID.toString();
  if (req.query.professor_id == null) {
    res.status(204).json({});
    return;
  }
  const professor_id = req.query.professor_id.toString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fullReturn: { [k: string]: any } = {};
  fullReturn["teachingSchedule"] = await FacultyTeaching.find({
    where: {
      faculty: {
        facultyId: professor_id,
      },
    },
    relations: {
      teaching: {
        teachingTimetable: {
          timetable: true,
        },
        course: true,
      },
    },
  });
  fullReturn["projectAdvisors"] = await ProjectThesis.find({
    where: {
      projectThesisFaculty: {
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["researchArticles"] = await Research.find({
    where: {
      researchAuthor: {
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["books"] = await AcademicWork.find({
    where: {
      academicWorkContrib: {
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["academicServices"] = await Activity.find({
    where: {
      activityFaculty: {
        participationType: 2,
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["administrativeTasks"] = await Activity.find({
    where: {
      activityFaculty: {
        participationType: 3,
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["maintenance"] = await Activity.find({
    where: {
      activityFaculty: {
        participationType: 4,
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["advisorParticipation"] = await Activity.find({
    where: {
      activityFaculty: {
        participationType: 1,
        faculty: {
          facultyId: professor_id,
        },
      },
    },
  });
  fullReturn["studentDevelopment"] = await StudentAdvisor.find({
    where: {
      faculty: {
        facultyId: professor_id,
      },
    },
    relations: {
      student: true,
      faculty: true,
    },
  });
  res.status(200).json(fullReturn);
  return;
}

export async function GetProfile(req: Request, res: Response) {
  // they give advisorID | advisor_name | student_name | year_level but we will only care about req.params.advisorID for now
  // if (!req.query || !req.query.advisorID) {
  //   res.status(400).send("Missing params " + JSON.stringify(req.query));
  //   return;
  // }
  //const advisorID = req.query.advisorID.toString();
  if (req.query.professor_id == null) {
    res.status(204).json({});
    return;
  }
  const professor_id = req.query.professor_id.toString();

  const returnData = await Faculty.findOne({
    where: {
      facultyId: professor_id,
    },
  });
  if (returnData != null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: { [k: string]: any } = {};
    cleaned.id = returnData?.facultyId;
    cleaned.email = "faculty.email@example.com";
    cleaned.fullName = returnData?.engFirstName + " " + returnData?.engLastName;
    cleaned.fullThaiName =
      returnData?.thaiFirstName + " " + returnData?.thaiLastName;
    res.status(200).json(cleaned);
    return;
  }
  res.status(204).json({});

  return;
}
