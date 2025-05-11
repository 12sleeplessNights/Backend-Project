// Endpoints here

import { Request, Response } from "express";
import { Faculty } from "../models/objects/faculty";
import { Activity } from "../models/activityData/activity";
import { ActivityFaculty } from "../models/activityData/activityFaculty";
import { FRCS, JSON } from "../utils/utils";
import { LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";

export const GETActivityRepoData = async (
  req: Request,
  res: Response,
  participationType: number,
) => {
  const activityFacultyRepo = ActivityFaculty.getRepository();
  const advisor_name = req.query.advisor_name || null;
  const activities_name = req.query.activities_name || null;
  const year = req.query.year ? String(req.query.year) : null;
  const advisorNameQuery = `%${FRCS(advisor_name)}%`;
  //console.log("advisor_name:", advisor_name);
  //console.log("activities_name:", activities_name);
  //console.log("year:", year);
  //console.log("advisorNameQuery:", advisorNameQuery);
  const dat = await activityFacultyRepo.find({
    where: [
      {
        participationType: participationType,
        activity: {
          activityName: activities_name
            ? Like(`%${FRCS(activities_name)}%`)
            : undefined,
          startDate: year ? LessThanOrEqual(`${year}-12-31`) : undefined,
          endDate: year ? MoreThanOrEqual(`${year}-01-01`) : undefined,
        },
        faculty: {
          fullName: advisor_name ? Like(advisorNameQuery) : undefined,
        },
      },
      {
        participationType: participationType,
        activity: {
          activityName: activities_name
            ? Like(`%${FRCS(activities_name)}%`)
            : undefined,
          startDate: year ? LessThanOrEqual(`${year}-12-31`) : undefined,
          endDate: year ? MoreThanOrEqual(`${year}-01-01`) : undefined,
        },
        faculty: {
          fullThaiName: advisor_name ? Like(advisorNameQuery) : undefined,
        },
      },
    ],
    relations: {
      faculty: true,
      activity: true,
    },
  });
  return res.status(200).send(dat);
};
