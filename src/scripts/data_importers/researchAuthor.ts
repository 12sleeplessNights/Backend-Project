import path from "path";
import fs from "fs";
import { Research } from "../../models/research/research";
import { getPosition } from "../../utils/utils";
import { ResearchAuthor } from "../../models/research/researchAuthor";
import { Repository } from "typeorm";
import { Faculty } from "../../models/objects/faculty";
export async function importResearchAuthorData(
  facultyRepo: Repository<Faculty>,
  researchRepo: Repository<Research>,
) {
  console.log("Adding ResearchAuthor Data...");

  //Making dir
  const scopusFolder = path.join(__dirname, "../../../data/scopus-json");
  const scopusFiles = fs.readdirSync(scopusFolder); // have files in scopus-json
  const authorData: author[] = []; // for filter duplicate data
  type author = {
    facultyId: string;
    researchId: number;
    position: number;
    status: string; //solo (sole author) ,last (corresponding author) ,normal (first/co-author)
  };

  let state = "normal";
  for (const res of scopusFiles) {
    const resData = JSON.parse(
      fs.readFileSync(path.join(scopusFolder, res), "utf-8"),
    );
    const resResult = resData["search-results"].entry;
    for (let i = 0; i < resResult.length; i++) {
      const resScopusId = resResult[i]["dc:identifier"].split(":")[1];
      if (authorData.includes(resScopusId)) {
        continue;
      }

      for (const resAuthor of resResult[i].author) {
        const resAuthorId = resAuthor["authid"];
        const fac = await facultyRepo.findOne({
          where: {
            scopusId: resAuthorId,
          },
        });
        if (fac == null) continue;

        const resRep = await researchRepo.findOne({
          where: {
            scopusId: resScopusId,
          },
        });
        if (resRep == null) continue;

        const pos = resAuthor["@seq"];

        if (pos == resResult[i].author.length) {
          state = "last";
        }

        if (resResult[i].author.length == 1) {
          state = "solo";
        }

        authorData.push({
          facultyId: fac.facultyId,
          researchId: resRep.researchid,
          position: pos,
          status: state,
        });
        state = "normal";
      }
      for (const aut of authorData) {
        const resAuMo = new ResearchAuthor();
        resAuMo.facultyId = aut.facultyId;
        resAuMo.researchId = aut.researchId;
        resAuMo.position = getPosition(aut.position, aut.status);

        await resAuMo.save();
      }
    }
  }
}
