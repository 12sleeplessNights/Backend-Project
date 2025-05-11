import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Teaching } from "./teaching";
import { TeachingTimetable } from "./teachingTimetable";

@Entity()
export class Timetable extends BaseEntity {
  @PrimaryGeneratedColumn()
  timetableId: number;

  @Column({
    length: 2,
  })
  meetingDay: string;

  @Column()
  meetingTimeStart: string;

  @Column()
  meetingTimeEnd: string;

  @Column({
    length: 10,
  })
  building: string;

  @Column({
    length: 10,
  })
  room: string;

  @Column({
    length: 8,
  })
  lessonType: string;
  @OneToMany(
    () => TeachingTimetable,
    (teachingTimetable) => teachingTimetable.timetable,
  )
  teachingTimetable: TeachingTimetable[];
}
