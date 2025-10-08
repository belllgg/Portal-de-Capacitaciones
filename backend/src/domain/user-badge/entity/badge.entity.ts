import { Entity, Column,OneToMany, PrimaryGeneratedColumn, CreateDateColumn,ManyToOne,JoinColumn,Index} from 'typeorm';
import { User } from '../../users/entity/users.entity';
import { Course } from '../../courses/entity/course.entity';
@Entity('badge_types')
export class BadgeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string;

  @Column({ type: 'text', nullable: true })
  criteria: string;

  @OneToMany(() => UserBadge, userBadge => userBadge.badgeType)
  userBadges: UserBadge[];
}
@Entity('user_badges')
@Index(['userId', 'badgeTypeId', 'courseId'], { unique: true })
export class UserBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'badge_type_id' })
  badgeTypeId: number;

  @Column({ name: 'course_id', nullable: true })
  courseId: number;

  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BadgeType, badgeType => badgeType.userBadges, { eager: false })
  @JoinColumn({ name: 'badge_type_id' })
  badgeType: BadgeType;

  @ManyToOne(() => Course, { eager: false })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
