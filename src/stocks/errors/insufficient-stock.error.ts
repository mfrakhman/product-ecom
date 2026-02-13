export class InsufficientStockError extends Error {
  constructor(
    public readonly skuId: string,
    public readonly requested: number,
  ) {
    super(`Insufficient stock for sku ${skuId}`);
    this.name = 'InsufficientStockError';
  }
}
