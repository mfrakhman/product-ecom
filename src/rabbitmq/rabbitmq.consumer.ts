import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { OrderEventsService } from './order-events.service';
import { OrderCreatedEvent } from './events/order-created.event';
import { RabbitmqPublisher } from './rabbitmq.publisher';
import { InsufficientStockError } from 'src/stocks/errors/insufficient-stock.error';
import { OrderStockFailedEvent } from './events/order-stock-failed.event';

@Injectable()
export class RabbitmqConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqConsumer.name);
  private connection?: amqplib.Connection;
  private channel?: amqplib.Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderEventsService: OrderEventsService,
    private readonly rabbitmqPublisher: RabbitmqPublisher,
  ) {}

  async onModuleInit() {
    const rabbitUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://127.0.0.1:5672',
    );
    const exchange = this.configService.get<string>(
      'RABBITMQ_EXCHANGE',
      'orders.event',
    );
    const exchangeType = this.configService.get<string>(
      'RABBITMQ_EXCHANGE_TYPE',
      'topic',
    );
    const queue = this.configService.get<string>(
      'RABBITMQ_QUEUE_PRODUCTS',
      'product-service',
    );

    this.connection = await amqplib.connect(rabbitUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(exchange, exchangeType, { durable: true });
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, 'order.created');

    this.logger.log('[RabbitMQ] preflight OK');
    this.logger.log(`[RabbitMQ] consuming ${exchange}:order.created`);

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString());
        const payload: OrderCreatedEvent = content?.data ?? content;
        console.log('[order.created] received');
        console.log('[order.created] payload', payload);
        await this.orderEventsService.onOrderCreated(payload);
        this.channel?.ack(msg);
      } catch (error) {
        if (error instanceof InsufficientStockError) {
          const content = JSON.parse(msg.content.toString());
          const payload: OrderCreatedEvent = content?.data ?? content;
          const failure = new OrderStockFailedEvent(
            payload.orderId,
            error.message,
            payload.items,
          );
          await this.rabbitmqPublisher.publish('order.stock_failed', failure);
          this.logger.warn(
            `[order.created] stock failed for order ${payload.orderId}`,
          );
          this.channel?.ack(msg);
          return;
        }
        const err = error as Error;
        this.logger.error('Failed to process order.created', err.stack);
        this.channel?.nack(msg, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
