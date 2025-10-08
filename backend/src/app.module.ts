import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './infrastructure/interface/common/config/config';
import { UsersModule } from './infrastructure/controllers-modules/users/module/users.module';
import { CourseModule } from './infrastructure/controllers-modules/courses/module/course.module';
import { ContentsModule } from './infrastructure/controllers-modules/contents/module/content.module';
import { ChapterModule } from './infrastructure/controllers-modules/chapters/module/chapter.module';
import { ProgressModule } from './infrastructure/controllers-modules/progress/module/progress.module';
import { BadgesModule  } from './infrastructure/controllers-modules/user-badge/module/badge.module';
import { CategoryModuleM } from './infrastructure/controllers-modules/modules-category/module/module-category.module';
import { getPostgressConfig } from './infrastructure/interface/common/databases/typeorm.config';
import { AuthModule } from './infrastructure/auth/auth.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration], 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getPostgressConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CategoryModuleM,
    CourseModule,
    ChapterModule,
    ContentsModule,
    ProgressModule,
    BadgesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}