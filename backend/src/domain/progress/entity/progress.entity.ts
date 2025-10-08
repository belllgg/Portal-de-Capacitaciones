import { Entity, Column, PrimaryGeneratedColumn,CreateDateColumn,ManyToOne,JoinColumn,Index} from 'typeorm';
import { User } from '../../users/entity/users.entity';
import { Chapter } from '../../chapters/entity/chapter.entity';
import { Course } from '../../courses/entity/course.entity';

@Entity('user_chapter_progress')
@Index(['userId', 'chapterId'], { unique: true })
export class UserChapterProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'chapter_id' })
  chapterId: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chapter, { eager: false })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;
}

@Entity('user_course_progress')
@Index(['userId', 'courseId'], { unique: true })
export class UserCourseProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ 
    name: 'progress_percentage', 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0 
  })
  progressPercentage: number;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, { eager: false })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}