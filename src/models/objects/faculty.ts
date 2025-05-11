import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  BaseEntity,
  VirtualColumn,
} from "typeorm";
import { StudentAdvisor } from "./studentAdvisor";
import { ProjectThesisFaculty } from "../teachings/projectThesisFaculty";
import { FacultyTeaching } from "../teachings/facultyTeaching";
import { ResearchAuthor } from "../research/researchAuthor";
import { AcademicWorkContrib } from "../research/academicWorkContrib";
import { ActivityFaculty } from "../activityData/activityFaculty";

@Entity()
export class Faculty extends BaseEntity {
  @PrimaryColumn({
    length: 8,
  })
  facultyId: string;

  @Column({
    length: 7,
  })
  abbrev: string;

  @Column({
    length: 128,
  })
  engFirstName: string;

  @Column({
    length: 128,
  })
  engLastName: string;

  @Column({
    length: 128,
    nullable: true,
  })
  otherEngLastName: string;

  @Column({
    length: 128,
  })
  thaiFirstName: string;

  @Column({
    length: 128,
  })
  thaiLastName: string;

  @Column({
    length: 128,
    nullable: true,
  })
  otherThaiLastName: string;

  @Column()
  academicTitle: number;

  @Column({
    length: 32,
    nullable: true,
  })
  scopusId: string;

  @Column()
  major: number;

  @Column({
    length: 512,
    nullable: true,
  })
  fields: string;

  @OneToMany(() => StudentAdvisor, (studentAdvisor) => studentAdvisor.faculty, {
    cascade: true,
  })
  studentAdvisor: StudentAdvisor[];

  @OneToMany(
    () => FacultyTeaching,
    (facultyTeaching) => facultyTeaching.faculty,
    {
      cascade: true,
    },
  )
  facultyTeaching: FacultyTeaching[];

  @OneToMany(
    () => ProjectThesisFaculty,
    (projectThesisFaculty) => projectThesisFaculty.faculty,
    {
      cascade: true,
    },
  )
  projectThesisFaculty: ProjectThesisFaculty[];

  @OneToMany(() => ResearchAuthor, (researchAuthor) => researchAuthor.faculty, {
    cascade: true,
  })
  researchAuthor: ResearchAuthor[];

  @OneToMany(
    () => AcademicWorkContrib,
    (academicWorkContrib) => academicWorkContrib.faculty,
    {
      cascade: true,
    },
  )
  academicWorkContrib: AcademicWorkContrib[];

  @OneToMany(
    () => ActivityFaculty,
    (activityFaculty) => activityFaculty.faculty,
  )
  activityFaculty: ActivityFaculty[];
  @VirtualColumn({
    type: "varchar",
    query: (alias) =>
      `(SELECT CONCAT(faculty.engFirstName, ' ', faculty.engLastName) FROM faculty WHERE faculty.facultyId = ${alias}.facultyId)`,
  })
  fullName: string;

  @VirtualColumn({
    type: "varchar",
    query: (alias) =>
      `(SELECT CONCAT(faculty.thaiFirstName, ' ', faculty.thaiLastName) FROM faculty WHERE faculty.facultyId = ${alias}.facultyId)`,
  })
  fullThaiName: string;
}
