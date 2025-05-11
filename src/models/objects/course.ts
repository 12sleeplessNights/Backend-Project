import { Entity, Column, OneToMany, PrimaryColumn, BaseEntity } from "typeorm";
import { Teaching } from "../teachings/teaching";
import { ProjectThesis } from "../teachings/projectThesis";

@Entity()
export class Course extends BaseEntity {
  @PrimaryColumn({
    length: 7,
  })
  courseId: string;

  @Column({
    length: 256,
  })
  courseTitle: string;

  @Column({
    length: 32,
  })
  courseType: string;

  @Column()
  creditLect: number;

  @Column()
  creditNonLect: number;

  @Column()
  creditTotal: number;

  @OneToMany(() => Teaching, (teaching) => teaching.course, {
    cascade: true,
  })
  teaching: Teaching[];

  @OneToMany(() => ProjectThesis, (projectThesis) => projectThesis.course, {
    cascade: true,
  })
  projectThesis: ProjectThesis[];
}
