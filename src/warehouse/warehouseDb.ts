import { ObjectId } from 'mongodb'
import { type BookID, type OrderId, type ShelfId } from '../../adapter/assignment-4.js'
import { client } from '../database_access.js'
import { type WarehouseData, type WarehouseDatabaseAccessor } from './types.js'

export async function getWarehouseDatabase (dbName?: string): Promise<WarehouseDatabaseAccessor> {
  const database = client.db(dbName ?? Math.floor(Math.random() * 100000).toPrecision().toString())
  const books = database.collection<{ book: BookID, shelf: ShelfId, count: number }>('books')
  await books.createIndex({ book: 1, shelf: 1 }, { unique: true })
  const orders = database.collection<{ books: Record<BookID, number> }>('orders')

  return {
    database,
    books,
    orders
  }
}

export class DatabaseWarehouse implements WarehouseData {
  accessor: WarehouseDatabaseAccessor

  constructor (accessor: WarehouseDatabaseAccessor) {
    this.accessor = accessor
  }

  async placeBookOnShelf (book: string, shelf: string, count: number): Promise<void> {
    await this.accessor.books.insertOne({ book, shelf, count })
  }

  async getCopiesOnShelf (book: string, shelf: string): Promise<number> {
    const result = await this.accessor.books.findOne({ book, shelf })
    return result !== null ? result.count : 0
  }

  async getCopies (book: string): Promise<Record<ShelfId, number>> {
    const result = this.accessor.books.find({ book })
    const copies: Record<ShelfId, number> = {}

    while (await result.hasNext()) {
      const value = await result.next()
      if (value === null) {
        break
      }
      copies[value.shelf] = value.count
    }

    return copies
  }

  async getOrder (order: OrderId): Promise<Record<BookID, number> | false> {
    const result = await this.accessor.orders.findOne({ _id: ObjectId.createFromHexString(order) })
    return result !== null ? result.books : false
  }

  async removeOrder (order: OrderId): Promise<void> {
    await this.accessor.orders.deleteOne({ _id: ObjectId.createFromHexString(order) })
  }

  async listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
    const result = await this.accessor.orders.find().toArray()

    return result.map(({ _id, books }) => {
      return { orderId: _id.toHexString(), books }
    })
  }

  async placeOrder (books: Record<string, number>): Promise<OrderId> {
    const result = await this.accessor.orders.insertOne({ books })
    return result.insertedId.toHexString()
  }
}

export class InMemoryWarehouse implements WarehouseData {
  books: Record<BookID, Record<ShelfId, number>>
  orders: Record<OrderId, Record<BookID, number>>

  constructor (params?: { books?: Record<BookID, Record<ShelfId, number>>, orders?: Record<OrderId, Record<ShelfId, number>> }) {
    const { books, orders } = params ?? {}
    this.books = books ?? {}
    this.orders = orders ?? {}
  }

  async placeBookOnShelf (bookId: string, shelf: string, count: number): Promise<void> {
    const book = this.books[bookId] ?? {}
    this.books[bookId] = { ...book, [shelf]: count }
  }

  async getCopiesOnShelf (bookId: string, shelf: string): Promise<number> {
    const book = this.books[bookId] ?? {}
    return book[shelf] ?? 0
  }

  async getCopies (bookId: string): Promise<Record<ShelfId, number>> {
    const book = this.books[bookId] ?? {}
    return book
  }

  async getOrder (order: OrderId): Promise<Record<BookID, number> | false> {
    return order in this.orders ? this.orders[order] : false
  }

  async removeOrder (order: OrderId): Promise<void> {
    const orders: Record<string, Record<BookID, number>> = {}

    for (const orderId of Object.keys(this.orders)) {
      if (orderId !== order) {
        orders[orderId] = this.orders[orderId]
      }
    }

    this.orders = orders
  }

  async listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
    return Object.keys(this.orders).map((orderId) => {
      const books = this.orders[orderId]
      return { orderId, books }
    })
  }

  async placeOrder (books: Record<string, number>): Promise<OrderId> {
    const order = new ObjectId().toHexString()
    this.orders[order] = books
    return order
  }
}

export async function getDefaultWarehouseDatabase (name?: string): Promise<WarehouseData> {
  const db = await getWarehouseDatabase(name)
  return new DatabaseWarehouse(db)
}

export async function getDefaultWarehouseData (): Promise<WarehouseData> {
  return await getDefaultWarehouseDatabase()
}
