import { Module } from '@nestjs/common';
import { OrderEventsService } from './order-events.service';
import { StocksModule } from 'src/stocks/stocks.module';
import { RabbitmqConsumer } from './rabbitmq.consumer';
import { RabbitmqPublisher } from './rabbitmq.publisher';

@Module({
  imports: [StocksModule],
  providers: [OrderEventsService, RabbitmqConsumer, RabbitmqPublisher],
})
export class RabbitmqModule {}
