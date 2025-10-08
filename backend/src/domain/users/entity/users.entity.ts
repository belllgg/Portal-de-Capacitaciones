import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => User, user => user.role)
  users: User[];
}

@Entity('user_states')
export class UserState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => User, user => user.state)
  users: User[];
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, role => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'state_id', default: 1 })
  stateId: number;

  @ManyToOne(() => UserState, state => state.users, { eager: true })
  @JoinColumn({ name: 'state_id' })
  state: UserState;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}