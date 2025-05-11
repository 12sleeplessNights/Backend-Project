import { Repository } from "typeorm";
import { JSON } from "../../utils/utils";
import { Faculty } from "../../models/objects/faculty";
import { FacultyTeaching } from "../../models/teachings/facultyTeaching";
import { Teaching } from "../../models/teachings/teaching";

export async function importFacultyTeaching(
  uniqueDg216: JSON[],
  facultyRepo: Repository<Faculty>,
  teachingRepo: Repository<Teaching>,
) {
  {
    console.log("Adding Faculty Teaching...");
    for await (const entriesInDG216 of uniqueDg216) {
      const faculty = await facultyRepo.findOne({
        where: {
          abbrev: entriesInDG216.NAME_ABBR,
        },
      });
      const teaching = await teachingRepo.findOne({
        where: {
          courseId: entriesInDG216.COURSE_CODE,
          year: parseInt(entriesInDG216.ACAD_YEAR),
          term: parseInt(entriesInDG216.SEMESTER),
          section: entriesInDG216.SECTION,
        },
      });
      if (faculty != null && teaching != null) {
        const facultyTeaching = new FacultyTeaching();
        facultyTeaching.faculty = faculty;
        facultyTeaching.teaching = teaching;
        await facultyTeaching.save();
      }
    }
  }
}

export async function importIncrementFacultyTeaching(
  uniqueDg216: JSON[],
  facultyRepo: Repository<Faculty>,
  teachingRepo: Repository<Teaching>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  {
    console.log("[I] Adding Faculty Teaching...");
    for await (const entriesInDG216 of uniqueDg216) {
      const faculty = await facultyRepo.findOne({
        where: {
          abbrev: entriesInDG216.NAME_ABBR,
        },
      });
      const teaching = await teachingRepo.findOne({
        where: {
          courseId: entriesInDG216.COURSE_CODE,
          year: parseInt(entriesInDG216.ACAD_YEAR),
          term: parseInt(entriesInDG216.SEMESTER),
          section: entriesInDG216.SECTION,
        },
      });
      if (faculty != null && teaching != null) {
        const facultyTeaching = new FacultyTeaching();
        facultyTeaching.faculty = faculty;
        facultyTeaching.teaching = teaching;
        if (!dataCache["FacultyTeaching"]) {
          dataCache["FacultyTeaching"] = [];
        }
        dataCache["FacultyTeaching"].push(facultyTeaching);
      }
    }
  }
}
