import { Request, Response } from "express";
import { FacultyDataSource } from "../utils/db";
import { StudentAdvisor } from "../models/objects/studentAdvisor";
import { Teaching } from "../models/teachings/teaching";
import { FacultyTeaching } from "../models/teachings/facultyTeaching";
import { MoreThan } from "typeorm";

export async function GETtimetable(req: Request, res: Response) {
  // they give advisorID | advisor_name | student_name | year_level but we will only care about req.params.advisorID for now
  // if (!req.query || !req.query.advisorID) {
  //   res.status(400).send("Missing params " + JSON.stringify(req.query));
  //   return;
  // }
  //const advisorID = req.query.advisorID.toString();
  const facultyRel = await FacultyDataSource.getRepository(
    FacultyTeaching,
  ).find({
    relations: {
      faculty: true,
      teaching: true,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const returnData: any[] = [];
  res.status(200).json(returnData);
  return;
}

export async function GETteachingSchedule(req: Request, res: Response) {
  const {
    courseID,
    courseName,
    professorName,
    daysWeek,
    semester,
    year,
    section,
  } = req.query;
  try {
    const teachingSchedule = await FacultyDataSource.getRepository(
      Teaching,
    ).find({
      where: {
        ...(courseID && { courseId: courseID.toString() }),
        ...(courseName && {
          course: {
            courseTitle: courseName.toString(),
          },
        }),
        ...(professorName && {
          facultyTeaching: {
            faculty: {
              engFirstName: professorName.toString().split(" ")[0],
              engLastName: professorName.toString().split(" ")[1],
            },
          },
        }),
        ...(daysWeek && {
          facultyTeaching: {
            teaching: {
              enrollStudents: MoreThan(0),
              teachingTimetable: {
                timetable: {
                  meetingDay: daysWeek.toString(),
                },
              },
            },
          },
        }),
        ...(semester && {
          facultyTeaching: {
            teaching: {
              enrollStudents: MoreThan(0),
              term: parseInt(semester.toString()),
            },
          },
        }),
        ...(year && {
          facultyTeaching: {
            teaching: {
              enrollStudents: MoreThan(0),
              year: parseInt(year.toString()),
            },
          },
        }),
        ...(section && {
          facultyTeaching: {
            teaching: {
              enrollStudents: MoreThan(0),
              section: section.toString(),
            },
          },
        }),
      },
      relations: {
        course: true,
        facultyTeaching: {
          faculty: true,
          teaching: true,
        },
        teachingTimetable: {
          timetable: true,
        },
      },
    });

    if (teachingSchedule.length === 0) {
      res.status(404).send("No teaching schedule found");
      return;
    }

    res.status(200).json(teachingSchedule);
  } catch {
    res.status(500).send("Internal server error");
  }
}
