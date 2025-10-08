import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,ManyToOne,JoinColumn,OneToMany} from 'typeorm';
import { Chapter } from '../../chapters/entity/chapter.entity';
@Entity('content_types')
export class ContentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => ChapterContent, content => content.contentType)
  contents: ChapterContent[];
}
@Entity('chapter_contents')
export class ChapterContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chapter_id' })
  chapterId: number;

  @Column({ name: 'content_type_id' })
  contentTypeId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true })
  fileUrl: string;

  @Column({ name: 'file_size_mb', type: 'decimal', precision: 10, scale: 2, nullable: true })
  fileSizeMb: number;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Chapter, { eager: false })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @ManyToOne(() => ContentType, contentType => contentType.contents, { eager: false })
  @JoinColumn({ name: 'content_type_id' })
  contentType: ContentType;
}
