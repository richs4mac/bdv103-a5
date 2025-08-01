import { type ZodRouter } from 'koa-zod-router';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { type Book, type BookID } from '../../adapter/assignment-2';
import { getBookDatabase, type BookDatabaseAccessor } from '../database_access';

async function getBook(id: BookID, { books }: BookDatabaseAccessor): Promise<Book | false> {
  if (id.length !== 24) {
    console.error('Failed with id: ', id);
    return false;
  }
  const result = await books.findOne({ _id: ObjectId.createFromHexString(id.trim()) });
  if (result === null) {
    return false;
  }
  const book: Book = {
    id,
    name: result.name,
    author: result.author,
    description: result.description,
    price: result.price,
    image: result.image
  };
  return book;
}

export default function getBookRoute(router: ZodRouter): void {
  router.register({
    name: 'get book',
    method: 'get',
    path: '/books/:id',
    validate: {
      params: z.object({
        id: z.string().min(2)
      })
    },
    handler: async (ctx, next) => {
      const { id } = ctx.request.params;

      const result = await getBook(id, getBookDatabase());

      if (result === false) {
        ctx.status = 404;
        return await next();
      }

      ctx.body = result;
      await next();
    }
  });
}
