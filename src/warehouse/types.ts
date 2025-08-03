import { type Collection, type Db } from 'mongodb'
import { type BookID } from '../../adapter/assignment-2.js'
import { type OrderId, type ShelfId } from '../../adapter/assignment-4.js'

export interface WarehouseDatabaseAccessor {
  database: Db
  books: Collection<{ book: BookID, shelf: ShelfId, count: number }>
  orders: Collection<{ books: Record<BookID, number> }>
}

export interface WarehouseData {
  placeBookOnShelf: (bookId: BookID, shelf: ShelfId, count: number) => Promise<void>
  getCopiesOnShelf: (bookId: BookID, shelf: ShelfId) => Promise<number>
  getCopies: (bookId: BookID) => Promise<Record<ShelfId, number>>
  getOrder: (order: OrderId) => Promise<Record<BookID, number> | false>
  placeOrder: (books: Record<BookID, number>) => Promise<OrderId>
  listOrders: () => Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>>
  removeOrder: (order: OrderId) => Promise<void>
}

export interface AppWarehouseDatabaseState {
  warehouseDb: WarehouseData
}
