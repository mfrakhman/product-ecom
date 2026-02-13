import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StocksService } from 'src/stocks/stocks.service';
import { OrderCreatedEvent } from './events/order-created.event';

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
        this.logger.log(
          `[order.created] decreasing stock skuId=${item.skuId} quantity=${item.quantity}`,
        );
        await this.stocksService.decreaseStock(
          item.skuId,
          item.quantity,
          manager,
        );
        this.logger.log(
          `[order.created] decreased stock skuId=${item.skuId}`,
        );
      }
    });
  }
}
