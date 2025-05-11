import {
  activityDataFromType,
  JSON,
  readCSVNoChecks,
  uniqueActivities,
} from "../../utils/utils";
import { Activity } from "../../models/activityData/activity";

export async function importActivityData() {
  console.log("Adding Activities...");

  const ACculture: JSON[] = readCSVNoChecks("ACculture");
  const ACdevelop: JSON[] = readCSVNoChecks("ACdevelop");
  const ACmanagement: JSON[] = readCSVNoChecks("ACmanagement");
  const ACservices: JSON[] = readCSVNoChecks("ACservices");

  const uniqueACculture = uniqueActivities(ACculture, ["โครงการ"]);
  const uniqueACdevelop = uniqueActivities(ACdevelop, ["โครงการ"]);
  const uniqueACmanagement = uniqueActivities(ACmanagement, [
    "บริหาร/คณะกรรมการ",
  ]);
  const uniqueACservices = uniqueActivities(ACservices, ["งาน/คณะกรรมการ"]);

  const saveActivities = async (activities: JSON[], type: string) => {
    for await (const activity of activities) {
      const act = new Activity();
      const dat = activityDataFromType(activity, type);
      act.activityName = dat.name;
      act.startDate = dat.startDate;
      act.endDate = dat.endDate;
      await act.save();
    }
  };

  await saveActivities(uniqueACculture, "culture");
  await saveActivities(uniqueACdevelop, "develop");
  await saveActivities(uniqueACmanagement, "management");
  await saveActivities(uniqueACservices, "services");
}

export async function importIncrementActivityData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCache: { [k: string]: any[] },
) {
  console.log("[I] Adding Activities...");

  const ACculture: JSON[] = readCSVNoChecks("ACculture", "increment_data");
  const ACdevelop: JSON[] = readCSVNoChecks("ACdevelop", "increment_data");
  const ACmanagement: JSON[] = readCSVNoChecks(
    "ACmanagement",
    "increment_data",
  );
  const ACservices: JSON[] = readCSVNoChecks("ACservices", "increment_data");

  const uniqueACculture = uniqueActivities(ACculture, ["โครงการ"]);
  const uniqueACdevelop = uniqueActivities(ACdevelop, ["โครงการ"]);
  const uniqueACmanagement = uniqueActivities(ACmanagement, [
    "บริหาร/คณะกรรมการ",
  ]);
  const uniqueACservices = uniqueActivities(ACservices, ["งาน/คณะกรรมการ"]);

  const increaseActivities = async (activities: JSON[], type: string) => {
    for await (const activity of activities) {
      const act = new Activity();
      const dat = activityDataFromType(activity, type);
      act.activityName = dat.name;
      act.startDate = dat.startDate;
      act.endDate = dat.endDate;
      if (!dataCache["Activity"]) {
        dataCache["Activity"] = [];
      }
      dataCache["Activity"].push(act);
    }
  };

  await increaseActivities(uniqueACculture, "culture");
  await increaseActivities(uniqueACdevelop, "develop");
  await increaseActivities(uniqueACmanagement, "management");
  await increaseActivities(uniqueACservices, "services");
}

export const saveActivities = async (activities: JSON[], type: string) => {
  for await (const activity of activities) {
    const act = new Activity();
    const dat = activityDataFromType(activity, type);
    act.activityName = dat.name;
    act.startDate = dat.startDate;
    act.endDate = dat.endDate;
    await act.save();
  }
};
