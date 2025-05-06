import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Controller('download')
export class DownloadController {
  constructor(private readonly configService: ConfigService) {}

  @Get('database')
  async downloadDatabase(@Res() response: Response) {
    try {
      // Ottieni il nome del file dal .env
      const dbName = this.configService.get<string>('DB_NAME');

      // Costruisci il path assoluto al file
      const filePath = path.resolve(process.cwd(), dbName);

      // Verifica che il file esista
      if (!fs.existsSync(filePath)) {
        return response.status(404).json({
          message: 'Database file not found',
        });
      }

      const fileName = path.basename(filePath);

      // Imposta gli header per il download
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader(
        'Content-Disposition',
        `attachment; filename=${fileName}`,
      );

      // Crea il read stream e invia il file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(response);
    } catch (error) {
      return response.status(500).json({
        message: 'Error downloading database',
        error: error.message,
      });
    }
  }
}
