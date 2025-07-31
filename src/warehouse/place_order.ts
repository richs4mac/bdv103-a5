import { type ZodRouter } from 'koa-zod-router';
import { type BookID, type OrderId } from '../../adapter/assignment-4';
import { InMemoryWarehouse, type WarehouseData, getDefaultWarehouseData } from './warehouse_data';
import { z } from 'zod';

async function placeOrder(data: WarehouseData, books: BookID[]): Promise<OrderId> {
  const order: Record<BookID, number> = {};

  for (const book of books) {
    order[book] = 1 + (order[book] ?? 0);
  }

  return await data.placeOrder(order);
}

export function placeOrderRouter(router: ZodRouter): void {
  router.register({
    name: 'place an order',
    method: 'post',
    path: '/order',
    validate: {
      body: z.object({
        order: z.string().array()
      })
    },
    handler: async (ctx, next) => {
      const books: BookID[] = ctx.request.body.order;

      try {
        const result = await placeOrder(await getDefaultWarehouseData(), books);
        ctx.body = result;
        ctx.status = 201;
        return await next();
      } catch (e) {
        ctx.status = 500;
        return await next();
      }
    }
  });
}
