import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Repository {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  owner!: string;

  @Column()
  name!: string;
}
