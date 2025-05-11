import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActivityFaculty } from "./activityFaculty";

@Entity()
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  activityId: number;

  @Column({
    length: 512,
  })
  activityName: string;

  @Column({ type: "date", nullable: true })
  startDate: string;

  @Column({ type: "date", nullable: true })
  endDate: string;

  @OneToMany(
    () => ActivityFaculty,
    (activityFaculty) => activityFaculty.activity,
    {
      cascade: true,
      onDelete: "CASCADE",
    },
  )
  activityFaculty: ActivityFaculty[];
}
