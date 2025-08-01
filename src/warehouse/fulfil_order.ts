import { type ZodRouter } from 'koa-zod-router';
import { type ShelfId, type BookID, type OrderId } from '../../adapter/assignment-4';
import { InMemoryWarehouse, type WarehouseData, getDefaultWarehouseData } from './warehouse_data';
import { z } from 'zod';

async function fulfilOrder(data: WarehouseData, orderId: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number; }>): Promise<void> {
  const order = await data.getOrder(orderId);
  if (order === false) {
    throw new Error('no such order');
  }

  const removedCount: Record<BookID, number> = {};
  for (const { book, numberOfBooks } of booksFulfilled) {
    if (!(book in order)) {
      throw new Error('one of the books is not in the order');
    }
    removedCount[book] = numberOfBooks + (removedCount[book] ?? 0);
  }

  for (const book of Object.keys(order)) {
    if (removedCount[book] !== order[book]) {
      throw new Error('incorrect number of books');
    }
  }

  const processedFulfilment = await Promise.all(booksFulfilled.map(async ({ book, shelf, numberOfBooks }) => {
    const currentCopiesOnShelf = await data.getCopiesOnShelf(book, shelf);
    const newCopiesOnShelf = currentCopiesOnShelf - numberOfBooks;
    if (newCopiesOnShelf < 0) {
      throw new Error('not enough copies on given shelves');
    }
    return { book, shelf, numberOfBooks: newCopiesOnShelf };
  }));

  await data.removeOrder(orderId);
  await Promise.all(processedFulfilment.map(async ({ book, shelf, numberOfBooks }) => {
    await data.placeBookOnShelf(book, shelf, numberOfBooks);
  }));
}

export function fulfilOrderRouter(router: ZodRouter): void {
  router.register({
    name: 'fulfil order',
    method: 'put',
    path: '/fulfil/:order',
    validate: {
      params: z.object({
        order: z.string()
      }),
      body: z.object({
        book: z.string(),
        shelf: z.string(),
        numberOfBooks: z.number()
      }).array()
    },
    handler: async (ctx, next) => {
      const { order } = ctx.request.params;
      const booksFulfilled = ctx.request.body;

      try {
        await fulfilOrder(await getDefaultWarehouseData(), order, booksFulfilled);

        ctx.status = 200;
        return await next();
      } catch (e) {
        ctx.status = 500;
        return await next();
      }
    }
  });
}
