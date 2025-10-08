import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentType,ChapterContent } from '../../../../domain/contents/entity/content.entity';
import { ContentConsultDao } from '../../../../domain/contents/dao/content-consult.dao';
import { ContentUpdateDao } from '../../../../domain/contents/dao/content-update.dao';
import { ContentCreateDao } from '../../../../domain/contents/dao/content-create.dao';
import { ContentDeleteDao } from '../../../../domain/contents/dao/content-delete.dao';

import { ContentConsultService } from '../../../../application/services/contents/content-consult.service';
import { ContentCreateService } from '../../../../application/services/contents/content-create.service';
import { ContentUpdateService } from '../../../../application/services/contents/content-update.service';
import { ContentDeleteService } from '../../../../application/services/contents/content-delete.service';

import { ContentsController } from '../controller/content.controller';
import { ChapterModule } from '../../chapters/module/chapter.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([ChapterContent, ContentType]),
    ChapterModule 
  ],
  controllers: [ContentsController],
  providers: [ContentConsultDao,ContentUpdateDao,ContentConsultService,ContentDeleteService,ContentCreateDao,ContentDeleteDao,ContentUpdateService,ContentCreateService
  ],
  exports: [ContentConsultDao,ContentConsultService,ContentUpdateDao,ContentCreateDao,ContentDeleteDao,ContentDeleteService,ContentUpdateService,ContentCreateService
  ]
})
export class ContentsModule {}