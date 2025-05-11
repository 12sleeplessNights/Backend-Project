import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Student } from "./student";
import { Faculty } from "./faculty";

@Entity()
export class StudentAdvisor extends BaseEntity {
  @PrimaryColumn({
    length: 10,
  })
  studentId: string;

  @PrimaryColumn({
    length: 8,
  })
  facultyId: string;

  @Column({ type: "date" })
  startDate: string;

  @Column({ type: "date", nullable: true })
  endDate: string;

  @ManyToOne(() => Student, (student) => student.studentAdvisor)
  @JoinColumn({ name: "studentId" })
  student: Student;

  @ManyToOne(() => Faculty, (faculty) => faculty.studentAdvisor)
  @JoinColumn({ name: "facultyId" })
  faculty: Faculty;
}
