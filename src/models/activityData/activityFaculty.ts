import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  VirtualColumn,
} from "typeorm";
import { Activity } from "./activity";
import { Faculty } from "../objects/faculty";

@Entity()
export class ActivityFaculty extends BaseEntity {
  @PrimaryColumn()
  activityId: number;

  @PrimaryColumn({
    length: 8,
  })
  facultyId: string;

  @Column()
  participationType: number;

  @Column({
    length: 128,
  })
  role: string;

  @Column({ nullable: true })
  scale: number;

  @Column("decimal", { scale: 1, nullable: true })
  credit: number;

  @Column({
    length: 128,
    nullable: true,
  })
  client: string;

  @Column("decimal", { scale: 2, nullable: true })
  budget: number;

  @ManyToOne(() => Activity, (activity) => activity.activityFaculty, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "activityId" })
  activity: Activity;

  @ManyToOne(() => Faculty, (faculty) => faculty.activityFaculty)
  @JoinColumn({ name: "facultyId" })
  faculty: Faculty;
}
