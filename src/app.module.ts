import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkusModule } from './skus/skus.module';
import { StocksModule } from './stocks/stocks.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        migrationsRun: configService.get<string>('NODE_ENV') === 'production',
        migrations: [__dirname + '/migrations/*.js'],
      }),
    }),
    ProductsModule,
    SkusModule,
    StocksModule,
    RabbitmqModule,
    StorageModule,
  ],
})
export class AppModule {}
