import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AcademicWorkContrib } from "./academicWorkContrib";

@Entity()
export class AcademicWork extends BaseEntity {
  @PrimaryGeneratedColumn()
  academicWorkId: number;

  @Column()
  type: number;

  @Column()
  language: number;

  @Column()
  year: number;

  @Column({
    length: 256,
  })
  description: string;

  @Column({
    length: 256,
    nullable: true,
  })
  remarks: string;

  @OneToMany(
    () => AcademicWorkContrib,
    (academicWorkContrib) => academicWorkContrib.academicWork,
    {
      cascade: true,
    },
  )
  academicWorkContrib: AcademicWorkContrib[];
}
