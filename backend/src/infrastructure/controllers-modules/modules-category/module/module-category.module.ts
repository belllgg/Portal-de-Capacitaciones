import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from 'src/domain/modules-category/entity/module-category.entity';
import { ModuleConsultDao } from 'src/domain/modules-category/dao/module-consult.dao';
import { ModuleUpdateDao } from 'src/domain/modules-category/dao/module-update.dao';
import { ModuleCreateDao } from 'src/domain/modules-category/dao/module-create.dao';
import { ModuleDeleteDao } from 'src/domain/modules-category/dao/module-delete.dao';
import { ModuleConsultService } from 'src/application/services/module-category/module-consult.service';
import { ModuleUpdateService } from 'src/application/services/module-category/module-update.service';
import { ModuleCreateService } from 'src/application/services/module-category/module-create.service';
import { ModuleDeleteService } from 'src/application/services/module-category/module-delete.service';
import { ModulesController } from 'src/infrastructure/controllers-modules/modules-category/controller/module-category.controller';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import { PassportModule } from '@nestjs/passport'; // 

@Module({
  imports: [
    TypeOrmModule.forFeature([Modules]),
    AuthModule, 
    PassportModule, 
  ],
  providers: [ModuleConsultDao, ModuleCreateDao,ModuleConsultService,ModuleCreateService,ModuleUpdateDao,ModuleUpdateService,ModuleDeleteDao,ModuleDeleteService],
  controllers: [ModulesController],
  exports: [TypeOrmModule,ModuleConsultDao,ModuleCreateDao, ModuleConsultService,ModuleCreateService,ModuleUpdateDao,ModuleUpdateService,ModuleDeleteDao,ModuleDeleteService]
})
export class CategoryModuleM {}