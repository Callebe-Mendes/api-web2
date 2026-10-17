import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("situations")
export class Situation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nameSituation!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
