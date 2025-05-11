import { Request, Response } from "express";
import { And, In, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
import { AcademicWork } from "../models/research/academicWork";
import { Faculty } from "../models/objects/faculty";

export async function GETAcademicWorks(req: Request, res: Response) {
  const book_title = req.query.book_title || undefined;
  const author_list = req.query.author_list?.toString() || undefined;

  const author_list_arr =
    author_list != null ? author_list.split(",") : undefined;
  const year = req.query.year?.toString() || undefined;

  const books = await AcademicWork.getRepository().find({
    where: [
      {
        description:
          book_title != undefined ? Like(`%${book_title}%`) : undefined,
        academicWorkContrib: {
          faculty: {
            fullName:
              author_list_arr != undefined ? In(author_list_arr) : undefined,
          },
        },
        year: year != undefined ? parseInt(year) : undefined,
      },
      {
        description:
          book_title != undefined ? Like(`%${book_title}%`) : undefined,
        academicWorkContrib: {
          faculty: {
            fullThaiName:
              author_list_arr != undefined ? In(author_list_arr) : undefined,
          },
        },
        year: year != undefined ? parseInt(year) : undefined,
      },
    ],
    relations: {
      academicWorkContrib: {
        faculty: true,
      },
    },
  });
  res.status(200).send(books);
}
