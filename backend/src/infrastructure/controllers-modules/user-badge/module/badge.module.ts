import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeType, UserBadge } from '../../../../domain/user-badge/entity/badge.entity';
import { BadgeConsultDao } from '../../../../domain/user-badge/dao/badge-consult.dao';
import { BadgeMutationDao } from '../../../../domain/user-badge/dao/badge-mutation.dao';
import { BadgeConsultService } from '../../../../application/services/user-badge/badge-consult.service';
import { BadgeMutationService } from '../../../../application/services/user-badge/badge-mutation.service';
import { BadgeAwardService } from '../../../../application/services/user-badge/badge-award.service';
import { BadgesController } from '../../../../infrastructure/controllers-modules/user-badge/controller/badge.controller';
import { ProgressModule } from '../../progress/module/progress.module';
import { CourseModule } from '../../courses/module/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BadgeType, UserBadge]),
    forwardRef(() => ProgressModule), // ← USAR forwardRef AQUÍ TAMBIÉN
    CourseModule
  ],
  controllers: [BadgesController],
  providers: [
    BadgeConsultDao,
    BadgeMutationDao,
    BadgeConsultService,
    BadgeMutationService,
    BadgeAwardService
  ],
  exports: [
    BadgeConsultDao,
    BadgeConsultService,
    BadgeAwardService 
  ]
})
export class BadgesModule {}