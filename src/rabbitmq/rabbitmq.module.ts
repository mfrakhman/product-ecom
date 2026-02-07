import { Module } from '@nestjs/common';
import { OrderEventsService } from './order-events.service';
import { StocksModule } from 'src/stocks/stocks.module';
import { RabbitmqConsumer } from './rabbitmq.consumer';

@Module({
  imports: [StocksModule],
  providers: [OrderEventsService, RabbitmqConsumer],
})
export class RabbitmqModule {}
