import { ObjectId, type Collection, type Db } from 'mongodb';
import { type BookID, type OrderId, type ShelfId } from '../../adapter/assignment-4';
import { client } from '../database_access';
import { type WarehouseData, InMemoryWarehouse } from './warehouse_data';
import { generateId, seedWarehouseDatabase } from '../../database_test_utilities';

export interface WarehouseDatabaseAccessor {
  database: Db;
  books: Collection<{ book: BookID, shelf: ShelfId, count: number; }>;
  orders: Collection<{ books: Record<BookID, number>; }>;
}

export async function getWarehouseDatabase(): Promise<WarehouseDatabaseAccessor> {
  const database = client.db((global as any).MONGO_URI !== undefined ? Math.floor(Math.random() * 100000).toPrecision() : 'mcmasterful-warehouse');
  const books = database.collection<{ book: BookID, shelf: ShelfId, count: number; }>('books');
  await books.createIndex({ book: 1, shelf: 1 }, { unique: true });
  const orders = database.collection<{ books: Record<BookID, number>; }>('orders');

  return {
    database,
    books,
    orders
  };
}

export class DatabaseWarehouse implements WarehouseData {
  accessor: WarehouseDatabaseAccessor;

  constructor(accessor: WarehouseDatabaseAccessor) {
    this.accessor = accessor;
  }

  async placeBookOnShelf(book: string, shelf: string, count: number): Promise<void> {
    await this.accessor.books.insertOne({ book, shelf, count });
  }

  async getCopiesOnShelf(book: string, shelf: string): Promise<number> {
    const result = await this.accessor.books.findOne({ book, shelf });
    return result !== null ? result.count : 0;
  }

  async getCopies(book: string): Promise<Record<ShelfId, number>> {
    const result = this.accessor.books.find({ book });
    const copies: Record<ShelfId, number> = {};

    while (await result.hasNext()) {
      const value = await result.next();
      if (value === null) {
        break;
      }
      copies[value.shelf] = value.count;
    }

    return copies;
  }

  async getOrder(order: OrderId): Promise<Record<BookID, number> | false> {
    const result = await this.accessor.orders.findOne({ _id: ObjectId.createFromHexString(order) });
    return result !== null ? result.books : false;
  }

  async removeOrder(order: OrderId): Promise<void> {
    await this.accessor.orders.deleteOne({ _id: ObjectId.createFromHexString(order) });
  }

  async listOrders(): Promise<Array<{ orderId: OrderId, books: Record<BookID, number>; }>> {
    const result = await this.accessor.orders.find().toArray();

    return result.map(({ _id, books }) => {
      return { orderId: _id.toHexString(), books };
    });
  }

  async placeOrder(books: Record<string, number>): Promise<OrderId> {
    const result = await this.accessor.orders.insertOne({ books });
    return result.insertedId.toHexString();
  }
}
