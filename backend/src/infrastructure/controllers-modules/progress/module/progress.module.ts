import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCourseProgress, UserChapterProgress } from '../../../../domain/progress/entity/progress.entity';
import { ProgressConsultDao } from '../../../../domain/progress/dao/progress-consult.dao';
import { ProgressMutationDao } from '../../../../domain/progress/dao/progress-mutation.dao';
import { ProgressConsultService } from '../../../../application/services/progress/progress-consult.service';
import { ProgressMutationService } from '../../../../application/services/progress/progress-mutation.service';
import { ProgressController } from '../../../../infrastructure/controllers-modules/progress/controller/progress.controller';
import { CourseModule } from '../../courses/module/course.module';
import { ChapterModule } from '../../chapters/module/chapter.module';
import { BadgesModule } from '../../user-badge/module/badge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCourseProgress, UserChapterProgress]),
    CourseModule, 
    ChapterModule,
    forwardRef(() => BadgesModule) // ← USAR forwardRef AQUÍ
  ],
  controllers: [ProgressController],
  providers: [
    ProgressConsultDao,
    ProgressMutationDao,
    ProgressConsultService,
    ProgressMutationService
  ],
  exports: [
    ProgressConsultDao,
    ProgressConsultService
  ]
})
export class ProgressModule {}