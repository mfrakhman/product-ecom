import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StocksService } from 'src/stocks/stocks.service';
import { OrderCreatedEvent } from './events/order-created.event';
import { InsufficientStockError } from 'src/stocks/errors/insufficient-stock.error';

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(
    private readonly stocksService: StocksService,
    private readonly dataSource: DataSource,
  ) {}

  async onOrderCreated(event: OrderCreatedEvent) {
    if (!event?.items?.length) {
      this.logger.warn('order.created received with no items');
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      for (const item of event.items) {
        this.logger.log(`[order.created] reserving stock skuId=${item.skuId} quantity=${item.quantity}`);
        await this.stocksService.reserveStock(item.skuId, item.quantity, manager);
        this.logger.log(`[order.created] reserved stock skuId=${item.skuId}`);
      }
    });
  }

  async onPaymentConfirmed(orderId: string, items: { skuId: string; quantity: number }[]) {
    if (!items?.length) {
      this.logger.warn(`payment.confirmed received with no items orderId=${orderId}`);
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        this.logger.log(`[payment.confirmed] committing stock skuId=${item.skuId} quantity=${item.quantity}`);
        await this.stocksService.commitReservation(item.skuId, item.quantity, manager);
        this.logger.log(`[payment.confirmed] committed stock skuId=${item.skuId}`);
      }
    });
  }

  async onPaymentExpired(orderId: string, items: { skuId: string; quantity: number }[]) {
    if (!items?.length) {
      this.logger.warn(`payment.expired received with no items orderId=${orderId}`);
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        this.logger.log(`[payment.expired] releasing stock skuId=${item.skuId} quantity=${item.quantity}`);
        await this.stocksService.releaseReservation(item.skuId, item.quantity, manager);
        this.logger.log(`[payment.expired] released stock skuId=${item.skuId}`);
      }
    });
  }

  async onPaymentFailed(orderId: string, items: { skuId: string; quantity: number }[]) {
    // payment.failed means the QRIS payment attempt failed — release the reservation
    await this.onPaymentExpired(orderId, items);
  }
}
