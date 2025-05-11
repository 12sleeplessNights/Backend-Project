import { Repository } from "typeorm";
import { TeachingTimetable } from "../../models/teachings/teachingTimetable";
import { Timetable } from "../../models/teachings/timetable";
import { DAYS, JSON } from "../../utils/utils";
import { Teaching } from "../../models/teachings/teaching";

export async function importTimetableTeaching(
  dg206: JSON[],
  teachingRepo: Repository<Teaching>,
  timeTableRepo: Repository<Timetable>,
) {
  console.log("Adding Timetable Teaching...");
  {
    for await (const anEntry of dg206) {
      const teachingDataDataFromRepo = await teachingRepo.findOne({
        where: {
          courseId: anEntry.COURSECODE,
          enrollStudents: parseInt(anEntry.REALREG),
          maxStudents: parseInt(anEntry.TOTALREG),
          year: parseInt(anEntry.YEAR),
          term: parseInt(anEntry.SEMESTER),
          section: anEntry.SECTION,
        },
      });
      for (const day of DAYS) {
        if (anEntry[day].trim() !== "") {
          const timeTableDataFromRepo = await timeTableRepo.findOne({
            where: {
              meetingDay: anEntry[day],
              meetingTimeStart: anEntry.STARTTIME,
              meetingTimeEnd: anEntry.ENDTIME,
              building: anEntry.BUILDING,
              room: anEntry.ROOM,
              lessonType: anEntry.TEACHTYPE,
            },
          });
          if (
            timeTableDataFromRepo !== null &&
            teachingDataDataFromRepo !== null
          ) {
            const teachTimer = new TeachingTimetable();
            teachTimer.timetable = timeTableDataFromRepo;
            teachTimer.teaching = teachingDataDataFromRepo;
            await teachTimer.save();
          }
        }
      }
    }
  }
}

export async function importIncrementTimetableTeaching(
  dg206: JSON[],
  teachingRepo: Repository<Teaching>,
  timeTableRepo: Repository<Timetable>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  console.log("[I] Adding Timetable Teaching...");
  {
    for await (const anEntry of dg206) {
      const teachingDataDataFromRepo = await teachingRepo.findOne({
        where: {
          courseId: anEntry.COURSECODE,
          enrollStudents: parseInt(anEntry.REALREG),
          maxStudents: parseInt(anEntry.TOTALREG),
          year: parseInt(anEntry.YEAR),
          term: parseInt(anEntry.SEMESTER),
          section: anEntry.SECTION,
        },
      });
      for (const day of DAYS) {
        if (anEntry[day].trim() !== "") {
          const timeTableDataFromRepo = await timeTableRepo.findOne({
            where: {
              meetingDay: anEntry[day],
              meetingTimeStart: anEntry.STARTTIME,
              meetingTimeEnd: anEntry.ENDTIME,
              building: anEntry.BUILDING,
              room: anEntry.ROOM,
              lessonType: anEntry.TEACHTYPE,
            },
          });
          if (
            timeTableDataFromRepo !== null &&
            teachingDataDataFromRepo !== null
          ) {
            const teachTimer = new TeachingTimetable();
            teachTimer.timetable = timeTableDataFromRepo;
            teachTimer.teaching = teachingDataDataFromRepo;
            if (!dataCache["TimetableTeaching"]) {
              dataCache["TimetableTeaching"] = [];
            }
            dataCache["TimetableTeaching"].push(teachTimer);
          }
        }
      }
    }
  }
}
