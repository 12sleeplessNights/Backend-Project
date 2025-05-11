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
import { ResearchAuthor } from "./researchAuthor";
import { DatabaseType } from "./databaseType";

@Entity()
export class Research extends BaseEntity {
  @PrimaryGeneratedColumn()
  researchid: number;

  @Column({
    length: 128,
  })
  scopusId: string;

  @Column({
    length: 512,
  })
  title: string;

  @Column({
    length: 512,
  })
  publicationName: string;

  @Column({
    length: 256,
  })
  pubType: string; //aggreiationType

  @Column({
    length: 9,
    nullable: true,
  })
  issn1: string;

  @Column({
    length: 9,
    nullable: true,
  })
  issn2: string;

  @Column({
    length: 32,
    nullable: true,
  })
  isbn: string;

  @Column({
    length: 9,
    nullable: true,
  })
  volumn: string;

  @Column({
    length: 32,
    nullable: true,
  })
  issue: string;

  @Column({
    length: 32,
    nullable: true,
  })
  pageRange: string;

  @Column({
    type: "date",
    nullable: true,
  })
  coverDate: string;

  @Column({
    length: 128,
    nullable: true,
  })
  doi: string;

  @Column({
    length: 4096,
    nullable: true,
  })
  authors: string;

  @Column({ nullable: true })
  databaseId: number;

  @Column({ nullable: true })
  internationalCoop: number;

  @Column({
    length: 128,
    nullable: true,
  })
  inventionType: string;

  @Column({ nullable: true })
  level: number;

  @Column({
    nullable: true,
  })
  publicationTier: number;

  @Column({
    length: 256,
    nullable: true,
  })
  remarks: string;

  @OneToMany(
    () => ResearchAuthor,
    (researchAuthor) => researchAuthor.research,
    {
      cascade: true,
    },
  )
  researchAuthor: ResearchAuthor[];

  @ManyToOne(() => DatabaseType, (databaseType) => databaseType.research)
  @JoinColumn({ name: "databaseId" })
  databaseType: DatabaseType;
}
