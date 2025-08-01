import { type ZodRouter } from 'koa-zod-router';
import { type ShelfId, type BookID } from '../../adapter/assignment-4';
import { InMemoryWarehouse, type WarehouseData, getDefaultWarehouseData } from './warehouse_data';
import { z } from 'zod';

async function placeBooksOnShelf(data: WarehouseData, bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  if (numberOfBooks < 0) {
    throw new Error("Can't place less than 0 books on a shelf");
  }
  const current = await data.getCopiesOnShelf(bookId, shelf) ?? 0;
  await data.placeBookOnShelf(bookId, shelf, current + numberOfBooks);
}

export function placeBooksOnShelfRouter(router: ZodRouter): void {
  router.register({
    name: 'place books on shelf',
    method: 'put',
    path: '/warehouse/:book/:shelf/:number',
    validate: {
      params: z.object({
        book: z.string(),
        shelf: z.string(),
        number: z.coerce.number().positive()
      })
    },
    handler: async (ctx, next) => {
      const { book, shelf, number } = ctx.request.params;

      try {
        await placeBooksOnShelf(await getDefaultWarehouseData(), book, number, shelf);

        ctx.status = 200;
        return await next();
      } catch (e) {
        ctx.status = 500;
        return await next();
      }
    }
  });
}
