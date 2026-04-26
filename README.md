# product-service

Manages the product catalog, SKU variants, and stock inventory. Listens for `order.created` events from RabbitMQ to reserve stock, and publishes the result back to the order-service.

**Tech:** NestJS · TypeScript · PostgreSQL · TypeORM · RabbitMQ · MinIO

**Internal port:** `3002`

---

## API Endpoints

### Products

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List all active products |
| GET | `/products/:id` | Public | Get product with all SKUs |
| POST | `/products` | JWT (Admin) | Create product with initial SKUs |
| PATCH | `/products/:id` | JWT (Admin) | Update product details |
| DELETE | `/products/:id` | JWT (Admin) | Soft delete product |
| POST | `/products/:id/image` | JWT (Admin) | Upload product image to MinIO |
| DELETE | `/products/:id/image` | JWT (Admin) | Delete product image |

### SKUs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products/:id/skus` | Public | Get SKUs for a product |
| GET | `/skus/:id` | Public | Get SKU detail with stock |
| POST | `/skus` | JWT (Admin) | Create new SKU for a product |
| POST | `/skus/validate` | Internal | Validate SKU IDs and return current prices |
| POST | `/skus/:id/restock` | JWT (Admin) | Add stock to a SKU |
| POST | `/skus/:id/image` | JWT (Admin) | Upload SKU image |
| DELETE | `/skus/:id/image` | JWT (Admin) | Delete SKU image |

---

## Stock Model

Each SKU tracks two separate stock counters:

| Field | Description |
|---|---|
| `available` | Units available for new orders |
| `reserved` | Units held for pending (unpaid) orders |

On `order.created` → `available` decremented, `reserved` incremented.
On order cancellation → `reserved` released back to `available`.

---

## RabbitMQ Events

| Direction | Event | Trigger | Action |
|---|---|---|---|
| Consumes | `order.created` | Order placed by user | Reserve stock for each item |
| Publishes | `order.stock.reserved` | All items reserved OK | Signal order-service to proceed |
| Publishes | `order.stock.failed` | Insufficient stock | Signal order-service to cancel order |

---

## System Flow

### GET /products/:id

```
Client
  │
  ▼
[ product-service ]
  │
  ├── Query product from PostgreSQL (with SKUs and stock)
  └── Return product + SKU list with available stock counts
```

### POST /products (Admin)

```
Client (Admin JWT)
  │
  ▼
[ product-service ]
  │
  ├── Validate request body
  ├── Create product record in PostgreSQL
  ├── For each SKU in request:
  │     ├── Create SKU record
  │     └── Create stock record (available = quantity, reserved = 0)
  └── Return created product with SKUs
```

### POST /skus/validate (Internal — called by gateway during checkout)

```
[ API Gateway / Checkout ]
  │
  ▼
[ product-service ]
  │
  ├── Check each SKU ID exists and is active
  ├── Collect { id, price } for valid SKUs
  └── Return { valid: [...], invalid: [...] }
```

### RabbitMQ: order.created → Stock Reservation

```
[ Order Service ] ──── publish order.created ────▶ [ RabbitMQ ]
                                                        │
                                                        ▼
                                               [ product-service ]
                                                 Consume order.created
                                                 For each order item:
                                                   ├── Check available >= quantity
                                                   ├── available -= quantity
                                                   └── reserved  += quantity
                                                        │
                                        ┌───────────────┴───────────────┐
                                        ▼                               ▼
                               All items OK                      Any item fails
                                        │                               │
                               publish order.stock.reserved    publish order.stock.failed
```

---

## Project Structure

```
product-service/
└── src/
    ├── products/
    │   ├── entities/product.entity.ts   # Product (name, category, imageUrl, softDelete)
    │   ├── products.controller.ts       # CRUD + image upload endpoints
    │   ├── products.service.ts          # Business logic
    │   └── repositories/               # TypeORM queries
    ├── skus/
    │   ├── entities/sku.entity.ts       # SKU (skuCode, price, size, color, imageUrl)
    │   ├── skus.controller.ts           # CRUD + validate + restock endpoints
    │   ├── skus.service.ts
    │   └── repositories/
    ├── stocks/
    │   ├── entities/stock.entity.ts     # Stock (available, reserved) — 1:1 with SKU
    │   ├── repositories/stock.repository.ts
    │   └── errors/insufficient-stock.error.ts
    ├── rabbitmq/
    │   ├── rabbitmq.consumer.ts         # Consumes order.created
    │   ├── rabbitmq.publisher.ts        # Publishes stock.reserved / stock.failed
    │   └── order-events.service.ts      # Stock reservation logic
    ├── storage/
    │   └── storage.module.ts            # MinIO client — handles image upload/delete
    └── migrations/                      # TypeORM migration files (runs in production)
```

---

## Environment Variables

```env
PORT=3002
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=microserv_db

RABBITMQ_URL=amqp://guest:guest@localhost:5672

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=products
MINIO_USE_SSL=false
```

---

## Running Locally

```bash
npm install
npm run start:dev
```

Service runs on `http://localhost:3002`.

## Example Requests

### Get All Products
```bash
curl http://localhost:3002/products
```

### Create Product
```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic Sneaker",
    "description": "Everyday sneaker",
    "category": "SHOES",
    "skus": [
      {
        "skuCode": "SNK-WHT-42",
        "name": "Classic Sneaker White 42",
        "description": "White, size 42",
        "size": "42",
        "color": "White",
        "price": 350000,
        "isActive": true,
        "quantity": 50
      }
    ]
  }'
```

### Restock a SKU
```bash
curl -X POST http://localhost:3002/skus/<sku_uuid>/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'
```

## Docker

```bash
docker build -t product-service .
docker run --env-file .env -p 3002:3002 product-service
```

## Part of

[E-Commerce Microservices Platform](../README.md)
