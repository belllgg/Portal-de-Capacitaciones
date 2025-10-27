import { Entity, Column,OneToMany,PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,ManyToOne,JoinColumn} from 'typeorm';
import { Course } from '../../courses/entity/course.entity';
@Entity('chapter_states')
export class ChapterState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => Chapter, chapter => chapter.state)
  chapters: Chapter[];
}
@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'duration_minutes', nullable: true })
  durationMinutes: number;

  @Column({ name: 'state_id', default: 2 })
  stateId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Course, { eager: false })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => ChapterState, state => state.chapters, { eager: false })
  @JoinColumn({ name: 'state_id' })
  state: ChapterState;

  // @OneToMany(() => ChapterContent, content => content.chapter)
  // contents: ChapterContent[]; 
}
