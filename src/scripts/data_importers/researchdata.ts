import path from "path";
import fs from "fs";
import { Research } from "../../models/research/research";
import {
  getScopusAuthors,
  getScopusInterCoop,
  pubTierFromString,
  readCSVNoChecks,
} from "../../utils/utils";
export async function importResearchData() {
  console.log("Adding Research Data...");

  //Making dir
  const scopusFolder = path.join(__dirname, "../../../data/scopus-json");
  const scopusFiles = fs.readdirSync(scopusFolder); // have files in scopus-json
  const scopusData: string[] = []; // for filter duplicate data
  const scimago = readCSVNoChecks("Scimago2023");

  for (const res of scopusFiles) {
    const resData = JSON.parse(
      fs.readFileSync(path.join(scopusFolder, res), "utf-8"),
    );
    const resResult = resData["search-results"].entry;

    for (let i = 0; i < resResult.length; i++) {
      const resId = resResult[i]["dc:identifier"].split(":")[1];
      if (scopusData.includes(resId)) {
        continue;
      } else {
        scopusData.push(resId);
      }

      const resTitle = resResult[i]["dc:title"];
      const resPubName = resResult[i]["prism:publicationName"];
      const resPubType = resResult[i]["prism:aggregationType"];
      const resIssn1 = resResult[i]["prism:issn"];
      const resIssn2 = resResult[i]["prism:eissn"];
      const resIsbn =
        resResult[i]["prism:isbn"] != undefined
          ? resResult[i]["prism:isbn"][0]["$"].slice(1, -1)
          : null;
      const resVolumn = resResult[i]["prism:volume"];
      const resIssue = resResult[i]["prism:issueIdentifier"];
      const resPageRange = resResult[i]["prism:pageRange"];
      const resCoverDate = resResult[i]["prism:coverDate"];
      const resDoi = resResult[i]["prism:doi"];
      const resAuthor = getScopusAuthors(resResult[i]);
      const resAff = getScopusInterCoop(resResult[i]);
      let pubtier: string = "";
      for (const tier of scimago) {
        if (resPubName === tier.Title) {
          pubtier = tier.SJRBestQuartile;
        }
      }

      const resMo = new Research();
      resMo.scopusId = resId;
      resMo.title = resTitle;
      resMo.publicationName = resPubName;
      resMo.pubType = resPubType;
      resMo.issn1 = resIssn1;
      resMo.issn2 = resIssn2;
      resMo.isbn = resIsbn;
      resMo.volumn = resVolumn;
      resMo.issue = resIssue;
      resMo.pageRange = resPageRange;
      resMo.coverDate = resCoverDate;
      resMo.doi = resDoi;
      resMo.authors = resAuthor;
      resMo.databaseId = 1;
      resMo.internationalCoop = resAff ? 1 : 2;
      resMo.level = 2;
      resMo.publicationTier = pubTierFromString(pubtier)!;
      await resMo.save();
    }
  }
}
