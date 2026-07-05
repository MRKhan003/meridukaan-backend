import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: '*',
  },
})
export class AppWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitInvoiceCreated(data: {
    invoiceId: string;
    storeId: string;
    totalAmount: string;
    createdAt: string;
  }) {
    this.server.emit('invoice.created', data);
    this.logger.log(`Emitted invoice.created: ${data.invoiceId}`);
  }

  emitInventoryUpdated(data: {
    storeId: string;
    productId: string;
    newQty: number;
  }) {
    this.server.emit('inventory.updated', data);
    this.logger.log(
      `Emitted inventory.updated: ${data.productId} in store ${data.storeId} -> ${data.newQty}`,
    );
  }
}

