import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
      }),
    }),
  ],
  providers: [MediaService],
})
export class MediaModule {}
