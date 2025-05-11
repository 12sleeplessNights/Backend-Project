import { JSON, readCSVNoChecks } from "../../utils/utils";
import { AcademicWork } from "../../models/research/academicWork";
import { AcademicWorkContrib } from "../../models/research/academicWorkContrib";
import { Faculty } from "../../models/objects/faculty";

export async function importAcademicWorks() {
  console.log("Adding Academic Works...");

  const Academic_Work: JSON[] = readCSVNoChecks("Academic_Work");

  const uniqueAcademicWorks = Academic_Work.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (t) => t.description === value.description && t.year === value.year,
      ),
  );

  for await (const acad of uniqueAcademicWorks) {
    const currentAcads = Academic_Work.filter((v) => {
      return v.description === acad.description && v.year === acad.year;
    });
    const ac = new AcademicWork();
    ac.type = parseInt(acad.type);
    ac.language = parseInt(acad.language);
    ac.description = acad.description;
    ac.year = parseInt(acad.year);
    await ac.save();
    const fac: Array<AcademicWorkContrib> = [];
    for await (const academicWorkEntry of currentAcads) {
      const asd = new AcademicWorkContrib();
      const au = academicWorkEntry.author.split(" ");
      const f = await Faculty.getRepository().findOne({
        where: {
          thaiFirstName: au[0],
          thaiLastName: au[1],
        },
      });
      if (f !== null) {
        asd.faculty = f;
        asd.academicWork = ac;
        asd.contribution = parseInt(academicWorkEntry.contribution);
        await asd.save();
        fac.push(asd);
      }
    }
  }
}
