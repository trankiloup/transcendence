import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Relations } from './Entity/relations.entity';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';


@Module({
    imports: [TypeOrmModule.forFeature([Relations]), UserModule],
    controllers: [RelationsController],
    providers: [RelationsService],
    exports: [RelationsService]
})
export class RelationsModule {}