import { Request, Response } from "express";
import { Research } from "../models/research/research";
import { And, In, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";

export async function GETResearchData(req: Request, res: Response) {
  const article_name = req.query.article_name || undefined;
  const journal_name = req.query.journal_name || undefined;
  const pub_tier = req.query.publication_tier?.toString() || undefined;
  const author_list = req.query.author_list?.toString() || undefined;
  const author_list_arr =
    author_list != null ? author_list.split(",") : undefined;
  const year = req.query.year || undefined;
  const researchs = await Research.getRepository().find({
    where: [
      {
        researchAuthor: {
          faculty: {
            fullName:
              author_list_arr != undefined ? In(author_list_arr) : undefined,
          },
        },
        coverDate:
          year != undefined
            ? And(
                MoreThanOrEqual(`${year}-01-01`),
                LessThanOrEqual(`${year}-12-31`),
              )
            : undefined,
        title:
          article_name != undefined ? Like(`%${article_name}%`) : undefined,
        publicationName:
          journal_name != undefined ? Like(`%${journal_name}%`) : undefined,
        publicationTier: pub_tier != undefined ? parseInt(pub_tier) : undefined,
      },
      {
        researchAuthor: {
          faculty: {
            fullThaiName:
              author_list_arr != undefined ? In(author_list_arr) : undefined,
          },
        },
        coverDate:
          year != undefined
            ? And(
                MoreThanOrEqual(`${year}-01-01`),
                LessThanOrEqual(`${year}-12-31`),
              )
            : undefined,
        title:
          article_name != undefined ? Like(`%${article_name}%`) : undefined,
        publicationName:
          journal_name != undefined ? Like(`%${journal_name}%`) : undefined,
        publicationTier: pub_tier != undefined ? parseInt(pub_tier) : undefined,
      },
    ],
  });
  res.status(200).send(researchs);
}
