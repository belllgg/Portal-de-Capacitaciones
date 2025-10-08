import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,ManyToOne,JoinColumn,OneToMany} from 'typeorm';
import { Modules } from '../../modules-category/entity/module-category.entity';
import { User } from '../../users/entity/users.entity';

@Entity('course_states')
export class CourseState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Course, course => course.state)
  courses: Course[];
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'module_id' })
  moduleId: number;

  @Column({ name: 'instructor_name', type: 'varchar', length: 100, nullable: true })
  instructorName: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  durationHours: number;

  @Column({ name: 'state_id', default: 2 })
  stateId: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Modules, { eager: false })
  @JoinColumn({ name: 'module_id' })
  module: Modules;

  @ManyToOne(() => CourseState, state => state.courses, { eager: false })
  @JoinColumn({ name: 'state_id' })
  state: CourseState;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
