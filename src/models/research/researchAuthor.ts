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
import { Research } from "./research";

@Entity()
export class ResearchAuthor extends BaseEntity {
  @PrimaryColumn({
    length: 8,
  })
  facultyId: string;

  @PrimaryColumn()
  researchId: number;

  @Column()
  position: number;

  @ManyToOne(() => Faculty, (faculty) => faculty.researchAuthor)
  @JoinColumn({ name: "facultyId" })
  faculty: Faculty;

  @ManyToOne(() => Research, (research) => research.researchAuthor)
  @JoinColumn({ name: "researchId" })
  research: Research;
}
