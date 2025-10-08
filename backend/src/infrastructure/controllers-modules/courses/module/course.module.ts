import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course,CourseState } from 'src/domain/courses/entity/course.entity';
import { CourseConsultDao } from 'src/domain/courses/dao/course-consult.dao';
import { CourseCreateDao } from 'src/domain/courses/dao/course-create.dao';
import { CourseDeleteDao } from 'src/domain/courses/dao/course-delete.dao';
import { CourseUpdateDao } from 'src/domain/courses/dao/course-update.dao';
import { ModuleConsultDao } from 'src/domain/modules-category/dao/module-consult.dao';
import { CourseCreateService } from 'src/application/services/courses/course-create.service';
import { CourseUpdateService } from 'src/application/services/courses/course-update.service';
import { CourseConsultService } from 'src/application/services/courses/course-consult.service';
import { CourseDeleteService } from 'src/application/services/courses/course-delete.service';
import { CoursesController } from 'src/infrastructure/controllers-modules/courses/controller/course.controller';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import { PassportModule } from '@nestjs/passport'; // 
import { CategoryModuleM    } from 'src/infrastructure/controllers-modules/modules-category/module/module-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course,CourseState]),CategoryModuleM,
    AuthModule, 
    PassportModule, 
  ],
  providers: [CourseCreateService, CourseConsultService,CourseConsultDao,CourseCreateDao,ModuleConsultDao,CourseUpdateDao,CourseUpdateService,CourseDeleteDao,CourseDeleteService],
  controllers: [CoursesController],
  exports: [TypeOrmModule,CourseCreateService,CourseConsultService, CourseConsultDao,CourseCreateDao,ModuleConsultDao,CourseUpdateDao,CourseUpdateService,CourseDeleteDao,CourseDeleteService]
})
export class CourseModule {}