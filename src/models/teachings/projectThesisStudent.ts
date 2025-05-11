import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ProjectThesis } from "./projectThesis";
import { Student } from "../objects/student";

@Entity()
export class ProjectThesisStudent extends BaseEntity {
  @PrimaryColumn()
  projectThesisId: number;

  @PrimaryColumn({
    length: 10,
  })
  studentId: string;

  @ManyToOne(
    () => ProjectThesis,
    (projectThesis) => projectThesis.projectThesisStudent,
  )
  @JoinColumn({ name: "projectThesisId" })
  projectThesis: ProjectThesis;

  @ManyToOne(() => Student, (student) => student.projectThesisStudent)
  @JoinColumn({ name: "studentId" })
  student: Student;
}
