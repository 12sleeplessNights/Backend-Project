import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Faculty } from "../objects/faculty";
import { AcademicWork } from "./academicWork";

@Entity()
export class AcademicWorkContrib extends BaseEntity {
  @PrimaryGeneratedColumn()
  academicWorkId: number;

  @Column({
    length: 8,
  })
  facultyId: string;

  @Column("decimal", { scale: 2 })
  contribution: number;

  @ManyToOne(() => Faculty, (faculty) => faculty.academicWorkContrib)
  @JoinColumn({ name: "facultyId" })
  faculty: Faculty;

  @ManyToOne(
    () => AcademicWork,
    (academicWork) => academicWork.academicWorkContrib,
  )
  @JoinColumn({ name: "academicWorkId" })
  academicWork: AcademicWork;
}
