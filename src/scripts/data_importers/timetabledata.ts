import fs from "fs";
import { Timetable } from "../../models/teachings/timetable";
import { DAYS, JSON } from "../../utils/utils";
import path from "path";
import { Repository } from "typeorm";

const forbiddenCourseCode = ["2301399", "2301499"];
const forbiddenClassType = ["IDPS", "IDVS"];
export async function importTimetableData(
  dg206: JSON[],
  timetableRepo: Repository<Timetable>,
) {
  {
    console.log("Adding Timetable Data...");
    const timesAvailable = dg206
      .filter((k) => k.COURSECODE.startsWith("2301"))
      .filter((value, index, self) => {
        return (
          index ===
          self.findIndex((t) => {
            return (
              !forbiddenClassType.includes(value.TEACHTYPE.trim()) &&
              !forbiddenCourseCode.includes(value.COURSECODE.trim()) &&
              t.TEACHTYPE.trim() === value.TEACHTYPE.trim() &&
              t.DAY1.trim() === value.DAY1.trim() &&
              t.DAY2.trim() === value.DAY2.trim() &&
              t.DAY3.trim() === value.DAY3.trim() &&
              t.DAY4.trim() === value.DAY4.trim() &&
              t.DAY5.trim() === value.DAY5.trim() &&
              t.DAY6.trim() === value.DAY6.trim() &&
              t.DAY7.trim() === value.DAY7.trim() &&
              t.STARTTIME.trim() === value.STARTTIME.trim() &&
              t.ENDTIME.trim() === value.ENDTIME.trim() &&
              t.BUILDING.trim() === value.BUILDING.trim() &&
              t.ROOM.trim() === value.ROOM.trim()
            );
          })
        );
      });
    /*
          fs.writeFileSync(
            path.join(global.appRoot, "../test_data", "timesAvailable.json"),
            JSON.stringify(timesAvailable, null, 2),
          );
          */
    const deduper: JSON[] = [];
    for (const timeEntry of timesAvailable) {
      for (const day of DAYS) {
        if (timeEntry[day].trim() !== "") {
          const timeTable: JSON = {};
          timeTable.lessonType = timeEntry.TEACHTYPE;
          timeTable.meetingDay = timeEntry[day];
          timeTable.meetingTimeStart = timeEntry.STARTTIME;
          timeTable.meetingTimeEnd = timeEntry.ENDTIME;
          timeTable.building = timeEntry.BUILDING;
          timeTable.room = timeEntry.ROOM;
          deduper.push(timeTable);
        }
      }
    }
    const uniqueDeduper = deduper.filter((value, index, self) => {
      return (
        index ===
        self.findIndex((t) => {
          return (
            t.lessonType === value.lessonType &&
            t.meetingDay === value.meetingDay &&
            t.meetingTimeStart === value.meetingTimeStart &&
            t.meetingTimeEnd === value.meetingTimeEnd &&
            t.building === value.building &&
            t.room === value.room
          );
        })
      );
    });

    fs.writeFileSync(
      path.join(global.appRoot, "../test_data", "uniqueDeduper.json"),
      JSON.stringify(uniqueDeduper, null, 2),
    );
    for (const entries of uniqueDeduper) {
      const timeTable = new Timetable();
      timeTable.lessonType = entries.lessonType;
      timeTable.meetingDay = entries.meetingDay;
      timeTable.meetingTimeStart = entries.meetingTimeStart;
      timeTable.meetingTimeEnd = entries.meetingTimeEnd;
      timeTable.building = entries.building;
      timeTable.room = entries.room;
      await timetableRepo.save(timeTable);
    }
  }
}

export async function importIncrementTimetableData(
  dg206: JSON[],
  timetableRepo: Repository<Timetable>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  {
    console.log("[I] Adding Timetable Data...");

    const timesAvailable = dg206
      .filter((k) => k.COURSECODE.startsWith("2301"))
      .filter((value, index, self) => {
        return (
          index ===
          self.findIndex((t) => {
            return (
              !forbiddenClassType.includes(value.TEACHTYPE.trim()) &&
              !forbiddenCourseCode.includes(value.COURSECODE.trim()) &&
              t.TEACHTYPE.trim() === value.TEACHTYPE.trim() &&
              t.DAY1.trim() === value.DAY1.trim() &&
              t.DAY2.trim() === value.DAY2.trim() &&
              t.DAY3.trim() === value.DAY3.trim() &&
              t.DAY4.trim() === value.DAY4.trim() &&
              t.DAY5.trim() === value.DAY5.trim() &&
              t.DAY6.trim() === value.DAY6.trim() &&
              t.DAY7.trim() === value.DAY7.trim() &&
              t.STARTTIME.trim() === value.STARTTIME.trim() &&
              t.ENDTIME.trim() === value.ENDTIME.trim() &&
              t.BUILDING.trim() === value.BUILDING.trim() &&
              t.ROOM.trim() === value.ROOM.trim()
            );
          })
        );
      });
    /*
          fs.writeFileSync(
            path.join(global.appRoot, "../test_data", "timesAvailable.json"),
            JSON.stringify(timesAvailable, null, 2),
          );
          */
    const deduper: JSON[] = [];
    for (const timeEntry of timesAvailable) {
      for (const day of DAYS) {
        if (timeEntry[day].trim() !== "") {
          const timeTable: JSON = {};
          timeTable.lessonType = timeEntry.TEACHTYPE;
          timeTable.meetingDay = timeEntry[day];
          timeTable.meetingTimeStart = timeEntry.STARTTIME;
          timeTable.meetingTimeEnd = timeEntry.ENDTIME;
          timeTable.building = timeEntry.BUILDING;
          timeTable.room = timeEntry.ROOM;
          deduper.push(timeTable);
        }
      }
    }
    const uniqueDeduper = deduper.filter((value, index, self) => {
      return (
        index ===
        self.findIndex((t) => {
          return (
            t.lessonType === value.lessonType &&
            t.meetingDay === value.meetingDay &&
            t.meetingTimeStart === value.meetingTimeStart &&
            t.meetingTimeEnd === value.meetingTimeEnd &&
            t.building === value.building &&
            t.room === value.room
          );
        })
      );
    });

    fs.writeFileSync(
      path.join(global.appRoot, "../test_data", "uniqueDeduper.json"),
      JSON.stringify(uniqueDeduper, null, 2),
    );
    for (const entries of uniqueDeduper) {
      const timeTable = new Timetable();
      timeTable.lessonType = entries.lessonType;
      timeTable.meetingDay = entries.meetingDay;
      timeTable.meetingTimeStart = entries.meetingTimeStart;
      timeTable.meetingTimeEnd = entries.meetingTimeEnd;
      timeTable.building = entries.building;
      timeTable.room = entries.room;
      if (!dataCache["Timetable"]) {
        dataCache["Timetable"] = [];
      }
      dataCache["Timetable"].push(timeTable);
    }
  }
}
