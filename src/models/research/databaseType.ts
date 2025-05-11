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

import { Research } from "./research";

@Entity()
export class DatabaseType extends BaseEntity {
  @PrimaryColumn()
  databaseId: number;

  @Column({
    length: 32,
  })
  typeName: string;

  @OneToMany(() => Research, (research) => research.databaseType, {
    cascade: true,
  })
  research: Research[];
}
