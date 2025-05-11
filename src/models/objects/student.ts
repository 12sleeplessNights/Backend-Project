import { Entity, Column, PrimaryColumn, OneToMany, BaseEntity } from "typeorm";
import { StudentAdvisor } from "./studentAdvisor";
import { ProjectThesisStudent } from "../teachings/projectThesisStudent";

@Entity()
export class Student extends BaseEntity {
  @PrimaryColumn({
    length: 10,
  })
  studentId: string;

  @Column({
    length: 128,
  })
  studentName: string;

  @Column({ nullable: true })
  enrollYear?: number;

  @Column({ nullable: true })
  enrollTerm?: number;

  @Column({ nullable: true })
  status?: number;

  @Column({ nullable: true })
  curriculum: number;

  @Column({
    nullable: true,
  })
  plan: number;

  @Column({
    length: 256,
    nullable: true,
  })
  remarks: string;

  @OneToMany(() => StudentAdvisor, (studentAdvisor) => studentAdvisor.student, {
    cascade: true,
  })
  studentAdvisor: StudentAdvisor[];

  @OneToMany(
    () => ProjectThesisStudent,
    (projectThesisStudent) => projectThesisStudent.student,
    {
      cascade: true,
    },
  )
  projectThesisStudent: ProjectThesisStudent[];
}
