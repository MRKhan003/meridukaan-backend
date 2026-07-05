import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { InventoryService } from './inventory.service';
import { PdfService } from './pdf.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [PrismaModule, WebSocketModule],
  controllers: [PosController],
  providers: [PosService, InventoryService, PdfService],
  exports: [PosService, InventoryService],
})
export class PosModule {}

