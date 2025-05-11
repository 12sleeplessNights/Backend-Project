import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "../objects/course";
import { FacultyTeaching } from "./facultyTeaching";
import { Timetable } from "./timetable";
import { TeachingTimetable } from "./teachingTimetable";
export { Timetable } from "./timetable";

@Entity()
export class Teaching extends BaseEntity {
  @PrimaryGeneratedColumn()
  teachingId: number;

  @Column({
    length: 7,
  })
  courseId: string;

  @Column({
    length: 4,
  })
  section: string;

  @Column()
  year: number;

  @Column()
  term: number;

  @Column()
  termType: number;

  @Column()
  enrollStudents: number;

  @Column()
  maxStudents: number;

  @Column({
    length: 512,
    nullable: true,
  })
  remarks: string;

  @ManyToOne(() => Course, (course) => course.teaching, { nullable: true })
  @JoinColumn({ name: "courseId" })
  course: Course;

  @OneToMany(
    () => FacultyTeaching,
    (facultyTeaching) => facultyTeaching.teaching,
  )
  facultyTeaching: FacultyTeaching[];

  @OneToMany(
    () => TeachingTimetable,
    (teachingTimetable: TeachingTimetable) => teachingTimetable.teaching,
  )
  teachingTimetable: TeachingTimetable[];
}
