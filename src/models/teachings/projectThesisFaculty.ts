import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ProjectThesis } from "./projectThesis";
import { Faculty } from "../objects/faculty";

@Entity()
export class ProjectThesisFaculty extends BaseEntity {
  @PrimaryColumn()
  projectThesisId: number;

  @PrimaryColumn({
    length: 8,
  })
  facultyId: string;

  @Column()
  role: number;

  @Column({
    nullable: true,
  })
  yearStart: number;

  @Column({
    nullable: true,
  })
  termStart: number;

  @Column({
    nullable: true,
  })
  maxTermCount: number;

  @ManyToOne(
    () => ProjectThesis,
    (projectThesis) => projectThesis.projectThesisFaculty,
  )
  @JoinColumn({ name: "projectThesisId" })
  projectThesis: ProjectThesis;

  @ManyToOne(() => Faculty, (faculty) => faculty.projectThesisFaculty)
  @JoinColumn({ name: "facultyId" })
  faculty: Faculty;
}
