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
import { Teaching, Timetable } from "./teaching";

@Entity()
export class TeachingTimetable extends BaseEntity {
  @PrimaryColumn()
  teachingId: number;

  @PrimaryColumn()
  timetableId: number;

  @ManyToOne(() => Timetable, (timetable) => timetable.teachingTimetable)
  @JoinColumn({ name: "timetableId" })
  timetable: Timetable;

  @ManyToOne(() => Teaching, (teaching) => teaching.teachingTimetable)
  @JoinColumn({ name: "teachingId" })
  teaching: Teaching;
}
