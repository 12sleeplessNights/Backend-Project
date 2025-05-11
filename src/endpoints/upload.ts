import { Request, Response } from "express";
import fs from "fs";
import {
  activityNumberFromString,
  activityStringFromNumber,
  getFirstColumnCleaned,
  parseCSVintoObject,
  parseCSVintoObjectSync,
} from "../utils/utils";
import { increaseActivitiesFaculty } from "../scripts/data_importers/activityFaculty";
import { saveActivities } from "../scripts/data_importers/activitydata";

export async function activityUploadHandler(req: Request, res: Response) {
  try {
    console.log(req.file);
    if (!req.file) {
      res.status(400).send("No file uploaded");
      return;
    }
    console.log(req.body);

    const pazu = req.file.path;
    const data: string[] = fs.readFileSync(pazu, "utf8").toString().split("\n");

    const splitData = data.map((x) => {
      return x.trim();
    });
    const type = activityNumberFromString(getFirstColumnCleaned(splitData)[1]);
    if (type == null) {
      res.status(400).send("Invalid type");
      return;
    }
    const objectData = parseCSVintoObjectSync(splitData, null, "ActivityData");
    //console.log(objectData);
    fs.unlinkSync(pazu);
    await saveActivities(objectData, getFirstColumnCleaned(splitData)[1]);
    await increaseActivitiesFaculty(
      objectData,
      getFirstColumnCleaned(splitData)[1],
    );

    res.status(200).send(objectData);
  } catch {
    res.status(400).send("Malformatted file");
  }
}
