import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role, UserState } from 'src/domain/users/entity/users.entity';
import { UserCreateDao } from 'src/domain/users/dao/user-create.dao';
import { UserUpdateDao } from 'src/domain/users/dao/user-update.dao';
import { UserDeleteDao } from 'src/domain/users/dao/user-delete.dao';
import { UserConsultDao } from 'src/domain/users/dao/user-consult.dao';
import { UserCreateService } from 'src/application/services/users/user-create.service';
import { UserUpdateService } from 'src/application/services/users/user-update.service';
import { UserDeleteService } from 'src/application/services/users/user-delete.service';
import { UserLoginService } from 'src/application/services/users/user-login.service';
import { UserConsultService } from 'src/application/services/users/user-consult.service';
import { UserController } from 'src/infrastructure/controllers-modules/users/controller/users.controller';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserState]),
    AuthModule, // ← Esto ahora proporcionará JwtService configurado
    PassportModule,
  ],
  providers: [
    UserCreateDao,
    // NO agregues JwtService aquí
    UserLoginService,
    UserCreateService,
    UserConsultDao,
    UserConsultService,
    UserUpdateService,
    UserDeleteService,
    UserDeleteDao,
    UserUpdateDao
  ],
  controllers: [UserController],
  exports: [
    UserCreateDao,
    UserCreateService,
    UserLoginService,
    UserConsultService,
    UserConsultDao,
    UserUpdateService,
    UserDeleteService,
    UserDeleteDao,
    UserUpdateDao
  ]
})
export class UsersModule {}