import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User,Role,UserState } from 'src/domain/users/entity/users.entity';
import { Modules } from 'src/domain/modules-category/entity/module-category.entity';
import { Course,CourseState } from 'src/domain/courses/entity/course.entity';
import { Chapter, ChapterState } from 'src/domain/chapters/entity/chapter.entity';
import { ContentType,ChapterContent } from '../../../../domain/contents/entity/content.entity';
import { UserCourseProgress,UserChapterProgress } from '../../../../domain/progress/entity/progress.entity';
import { BadgeType,UserBadge } from '../../../../domain/user-badge/entity/badge.entity';

export const getPostgressConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'), 
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'), 
  schema: configService.get<string>('DB_SCHEMA'), 
  entities: [
    User,UserState,Role,Modules,Course,CourseState,Chapter,ChapterState,ContentType,ChapterContent,UserCourseProgress,UserChapterProgress,BadgeType,UserBadge
  ],
  synchronize: false,
 
});