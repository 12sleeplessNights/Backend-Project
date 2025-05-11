import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProjectThesisStudent } from "./projectThesisStudent";
import { Course } from "../objects/course";
import { ProjectThesisFaculty } from "./projectThesisFaculty";

@Entity()
export class ProjectThesis extends BaseEntity {
  @PrimaryGeneratedColumn()
  projectThesisId: number;

  @Column({
    length: 7,
    nullable: true,
  })
  courseId: string;

  @Column({
    length: 512,
    nullable: true,
  })
  engTopic: string;

  @Column({
    length: 512,
    nullable: true,
  })
  thTopic: string;

  @Column({
    nullable: true,
    length: 32,
  })
  projectStatus: string;

  @Column({ type: "date", nullable: true })
  advisorAssignmentDate: string;

  @Column({ type: "date", nullable: true })
  proposalDate: string;

  @Column({ type: "date", nullable: true })
  defenseDate: string;

  @Column({
    nullable: true,
  })
  projYear: number;

  @Column({
    length: 256,
    nullable: true,
  })
  remarks: string;

  @OneToMany(
    () => ProjectThesisStudent,
    (projectThesisStudent) => projectThesisStudent.projectThesis,
    {
      cascade: true,
    },
  )
  projectThesisStudent: ProjectThesisStudent[];

  @ManyToOne(() => Course, (course) => course.projectThesis)
  @JoinColumn({ name: "courseId" })
  course: Course;

  @OneToMany(
    () => ProjectThesisFaculty,
    (projectThesisFaculty) => projectThesisFaculty.projectThesis,
    {
      cascade: true,
    },
  )
  projectThesisFaculty: ProjectThesisFaculty[];
}
