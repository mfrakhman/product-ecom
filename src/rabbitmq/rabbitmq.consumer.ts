import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { OrderEventsService } from './order-events.service';
import { OrderCreatedEvent } from './events/order-created.event';
import { RabbitmqPublisher } from './rabbitmq.publisher';
import { InsufficientStockError } from 'src/stocks/errors/insufficient-stock.error';
import { OrderStockFailedEvent } from './events/order-stock-failed.event';
import { OrderStockReservedEvent } from './events/order-stock-reserved.event';

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
    const rabbitUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://127.0.0.1:5672');
    const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'orders.event');
    const exchangeType = this.configService.get<string>('RABBITMQ_EXCHANGE_TYPE', 'topic');
    const queue = this.configService.get<string>('RABBITMQ_QUEUE_PRODUCTS', 'product-service');

    this.connection = await amqplib.connect(rabbitUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(exchange, exchangeType, { durable: true });
    await this.channel.assertQueue(queue, { durable: true });

    await this.channel.bindQueue(queue, exchange, 'order.created');
    await this.channel.bindQueue(queue, exchange, 'payment.confirmed');
    await this.channel.bindQueue(queue, exchange, 'payment.expired');
    await this.channel.bindQueue(queue, exchange, 'payment.failed');

    this.logger.log('[RabbitMQ] preflight OK');

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const routingKey = msg.fields.routingKey;
        const content = JSON.parse(msg.content.toString());
        const payload = content?.data ?? content;

        this.logger.log(`[RabbitMQ] received ${routingKey}`);

        if (routingKey === 'order.created') {
          const event: OrderCreatedEvent = payload;
          await this.orderEventsService.onOrderCreated(event);
          await this.rabbitmqPublisher.publish(
            'order.stock_reserved',
            new OrderStockReservedEvent(event.orderId, event.items),
          );

        } else if (routingKey === 'payment.confirmed') {
          await this.orderEventsService.onPaymentConfirmed(payload.orderId, payload.items);

        } else if (routingKey === 'payment.expired') {
          await this.orderEventsService.onPaymentExpired(payload.orderId, payload.items);

        } else if (routingKey === 'payment.failed') {
          await this.orderEventsService.onPaymentFailed(payload.orderId, payload.items);

        } else {
          this.logger.warn(`Unhandled routing key: ${routingKey}`);
        }

        this.channel?.ack(msg);
      } catch (error) {
        if (error instanceof InsufficientStockError) {
          const content = JSON.parse(msg.content.toString());
          const payload: OrderCreatedEvent = content?.data ?? content;
          const failure = new OrderStockFailedEvent(payload.orderId, error.message, payload.items);
          await this.rabbitmqPublisher.publish('order.stock_failed', failure);
          this.logger.warn(`[order.created] stock reservation failed for order ${payload.orderId}`);
          this.channel?.ack(msg);
          return;
        }
        const err = error as Error;
        this.logger.error(`Failed to process ${msg.fields.routingKey}`, err.stack);
        this.channel?.nack(msg, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
