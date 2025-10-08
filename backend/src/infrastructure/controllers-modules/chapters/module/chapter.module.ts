import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter, ChapterState } from 'src/domain/chapters/entity/chapter.entity';
import { ChapterConsultDao } from 'src/domain/chapters/dao/chapter-consult.dao';
import { ChapterCreateDao } from 'src/domain/chapters/dao/chapter-create.dao';
import { ChapterDeleteDao } from 'src/domain/chapters/dao/chapter-delete.dao';
import { CourseConsultDao } from 'src/domain/courses/dao/course-consult.dao';
import { ChapterUpdateDao } from 'src/domain/chapters/dao/chapter-update.dao';
import { ChapterCreateService } from 'src/application/services/chapters/chapter-create.service';
import { ChapterUpdateService } from 'src/application/services/chapters/chapter-update.service';
import { ChapterConsultService } from 'src/application/services/chapters/chapter-consult.service';
import { ChapterDeleteService } from 'src/application/services/chapters/chapter-delete.service';
import { ChaptersController } from 'src/infrastructure/controllers-modules/chapters/controller/chapter.controller';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import{CourseModule} from 'src/infrastructure/controllers-modules/courses/module/course.module'
import { PassportModule } from '@nestjs/passport'; // 
import { CategoryModuleM    } from 'src/infrastructure/controllers-modules/modules-category/module/module-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter,ChapterState]),CategoryModuleM,CourseModule,
    AuthModule, 
    PassportModule, 
  ],
  providers: [ChapterCreateService, ChapterConsultService,ChapterConsultDao,ChapterCreateDao,ChapterUpdateDao,ChapterUpdateService,ChapterDeleteDao,ChapterDeleteService,CourseConsultDao],
  controllers: [ChaptersController],
  exports: [ChapterCreateService,ChapterConsultService, ChapterConsultDao,ChapterCreateDao,ChapterUpdateDao,ChapterUpdateService,ChapterDeleteDao,ChapterDeleteService,CourseConsultDao]
})
export class ChapterModule {}