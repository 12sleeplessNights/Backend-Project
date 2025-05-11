import { Repository } from "typeorm";
import { ActivityFaculty } from "../../models/activityData/activityFaculty";
import {
  activityDataFromType,
  activityNumberFromString,
  JSON,
  NUNU,
  readCSVNoChecks,
} from "../../utils/utils";
import { Faculty } from "../../models/objects/faculty";
import { Activity } from "../../models/activityData/activity";

export async function importActivityFacultyData(
  facultyRepo: Repository<Faculty>,
  activityRepo: Repository<Activity>,
) {
  console.log("Adding Activities Faculty...");

  const ACculture: JSON[] = readCSVNoChecks("ACculture");
  const ACdevelop: JSON[] = readCSVNoChecks("ACdevelop");
  const ACmanagement: JSON[] = readCSVNoChecks("ACmanagement");
  const ACservices: JSON[] = readCSVNoChecks("ACservices");
  const saveActivitiesFaculty = async (activities: JSON[], type: string) => {
    for await (const activity of activities) {
      const dat = activityDataFromType(activity, type);
      const act = await activityRepo.findOne({
        where: {
          activityName: dat.name,
        },
      });
      const fac = dat.facultyName.split(" ");
      const faculty = await facultyRepo.findOne({
        where: {
          thaiFirstName: fac[0],
          thaiLastName: fac[1],
        },
      });
      if (act != null && faculty != null) {
        const actFac = new ActivityFaculty();
        // console.log(type);
        // console.log(activity);
        // console.log(dat);
        actFac.activity = act;
        actFac.faculty = faculty;
        actFac.participationType = activityNumberFromString(type)!;
        actFac.role = dat.role;
        actFac.scale = NUNU(dat.level);
        actFac.credit = NUNU(dat.cred);
        actFac.client = dat.client;
        actFac.budget = NUNU(dat.budget);
        await actFac.save();
      }
    }
  };

  await saveActivitiesFaculty(ACculture, "culture");
  await saveActivitiesFaculty(ACdevelop, "develop");
  await saveActivitiesFaculty(ACmanagement, "management");
  await saveActivitiesFaculty(ACservices, "services");
}

export async function importIncrementActivityFacultyData(
  facultyRepo: Repository<Faculty>,
  activityRepo: Repository<Activity>,
) {
  console.log("[I] Adding Activities Faculty...");

  const ACculture: JSON[] = readCSVNoChecks("ACculture", "increment_data");
  const ACdevelop: JSON[] = readCSVNoChecks("ACdevelop", "increment_data");
  const ACmanagement: JSON[] = readCSVNoChecks(
    "ACmanagement",
    "increment_data",
  );
  const ACservices: JSON[] = readCSVNoChecks("ACservices", "increment_data");

  await increaseActivitiesFaculty(ACculture, "culture");
  await increaseActivitiesFaculty(ACdevelop, "develop");
  await increaseActivitiesFaculty(ACmanagement, "management");
  await increaseActivitiesFaculty(ACservices, "services");
}

export const increaseActivitiesFaculty = async (
  activities: JSON[],
  type: string,
) => {
  for await (const activity of activities) {
    const dat = activityDataFromType(activity, type);
    const act = await Activity.getRepository().findOne({
      where: {
        activityName: dat.name,
      },
    });
    const fac = dat.facultyName.split(" ");
    const faculty = await Faculty.getRepository().findOne({
      where: {
        thaiFirstName: fac[0],
        thaiLastName: fac[1],
      },
    });
    if (act != null && faculty != null) {
      const actFac = new ActivityFaculty();
      // console.log(type);
      // console.log(activity);
      // console.log(dat);
      actFac.activity = act;
      actFac.faculty = faculty;
      actFac.participationType = activityNumberFromString(type)!;
      actFac.role = dat.role;
      actFac.scale = NUNU(dat.level);
      actFac.credit = NUNU(dat.cred);
      actFac.client = dat.client;
      actFac.budget = NUNU(dat.budget);
      await actFac.save();
    }
  }
};
