import { Repository } from "typeorm";
import { Faculty } from "../../models/objects/faculty";
import { NUNU, readCSVNoChecks } from "../../utils/utils";

export async function importFacultyData(facultyRepo: Repository<Faculty>) {
  const fparsed: { [k: string]: string }[] = readCSVNoChecks("MIXEDDATA");

  console.log("Adding Faculty Data...");

  for await (const rLoop of fparsed) {
    const f = new Faculty();
    f.facultyId = rLoop.facultyID;
    f.abbrev = rLoop.facultyAbbr;
    f.engFirstName = rLoop.engFirstname;
    f.engLastName = rLoop.engLastname;
    f.otherEngLastName = NUNU(rLoop.otherEngLastname)!;
    f.thaiFirstName = rLoop.thaiFirstname;
    f.thaiLastName = rLoop.thaiLastname;
    f.otherThaiLastName = NUNU(rLoop.otherThaiLastname)!;
    f.academicTitle = parseInt(rLoop.academicTitle);
    f.scopusId = NUNU(rLoop.scopusID)!;
    f.major = parseInt(rLoop.major)!;
    f.fields = NUNU(rLoop.fields)!;
    await facultyRepo.save(f);
  }
}

export async function importIncrementFacultyData(
  facultyRepo: Repository<Faculty>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  const fparsed: { [k: string]: string }[] = readCSVNoChecks(
    "MIXEDDATA",
    "increment_data",
  );

  console.log("[I] Adding Faculty Data...");

  for await (const rLoop of fparsed) {
    const f = new Faculty();
    f.facultyId = rLoop.facultyID;
    f.abbrev = rLoop.facultyAbbr;
    f.engFirstName = rLoop.engFirstname;
    f.engLastName = rLoop.engLastname;
    f.otherEngLastName = NUNU(rLoop.otherEngLastname)!;
    f.thaiFirstName = rLoop.thaiFirstname;
    f.thaiLastName = rLoop.thaiLastname;
    f.otherThaiLastName = NUNU(rLoop.otherThaiLastname)!;
    f.academicTitle = parseInt(rLoop.academicTitle);
    f.scopusId = NUNU(rLoop.scopusID)!;
    f.major = parseInt(rLoop.major)!;
    f.fields = NUNU(rLoop.fields)!;
    if (!dataCache["Faculty"]) {
      dataCache["Faculty"] = [];
    }
    dataCache["Faculty"].push(f);
  }
}
