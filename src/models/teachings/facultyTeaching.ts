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
import { Teaching } from "./teaching";

@Entity()
export class FacultyTeaching extends BaseEntity {
  @PrimaryColumn({
    length: 8,
  })
  facultyId: string;

  @PrimaryColumn()
  teachingId: number;

  @ManyToOne(() => Faculty, (faculty) => faculty.facultyTeaching)
  @JoinColumn({ name: "facultyId" })
  faculty: Faculty;

  @ManyToOne(() => Teaching, (teaching) => teaching.facultyTeaching)
  @JoinColumn({ name: "teachingId" })
  teaching: Teaching;
}
