import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Metadata extends BaseEntity {
  @PrimaryColumn()
  configName: string;
  @Column()
  data: string;
}
