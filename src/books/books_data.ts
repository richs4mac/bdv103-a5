import { getDefaultWarehouseDatabase } from '../warehouse/warehouseDb'
import { type BookID } from '../../adapter/assignment-2'
import { type OrderId, type ShelfId } from '../../adapter/assignment-4.js'
import { type BookData } from './types'

export interface BooksData {
  placeBookOnShelf: (bookId: BookID, shelf: ShelfId, count: number) => Promise<void>
  getCopiesOnShelf: (bookId: BookID, shelf: ShelfId) => Promise<number>
  getCopies: (bookId: BookID) => Promise<Record<ShelfId, number>>
  getOrder: (order: OrderId) => Promise<Record<BookID, number> | false>
  placeOrder: (books: Record<BookID, number>) => Promise<OrderId>
  listOrders: () => Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>>
  removeOrder: (order: OrderId) => Promise<void>
}

export async function getDefaultWarehouseData (dbName?: string): Promise<BookData> {
  return await getDefaultWarehouseDatabase(dbName)
}
