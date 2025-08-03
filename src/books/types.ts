import { type Collection, type Db } from 'mongodb'
import { type BookID } from '../../adapter/assignment-2'
import { type Book, type OrderId, type ShelfId } from '../../adapter/assignment-4'

export interface BookDatabaseAccessor {
  database: Db
  books: Collection<Book>
}

export interface BookData {
  // TODO update this with all books DB methods
  placeBookOnShelf: (bookId: BookID, shelf: ShelfId, count: number) => Promise<void>
  getCopiesOnShelf: (bookId: BookID, shelf: ShelfId) => Promise<number>
  getCopies: (bookId: BookID) => Promise<Record<ShelfId, number>>
  getOrder: (order: OrderId) => Promise<Record<BookID, number> | false>
  placeOrder: (books: Record<BookID, number>) => Promise<OrderId>
  listOrders: () => Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>>
  removeOrder: (order: OrderId) => Promise<void>
}

// TODO improve this
export interface AppBookDatabaseState {
  bookDb: any
}
