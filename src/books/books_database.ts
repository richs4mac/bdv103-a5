import { type Collection, type Db } from 'mongodb'
// We are importing the book type here, so we can keep our types consistent with the front end
import { type Book } from '../../adapter/assignment-3.js'
import { client, uri } from '../database_access.js'

// TODO improve this
export interface AppBookDatabaseState {
  bookDb: any
}

export interface BookDatabaseAccessor {
  database: Db
  books: Collection<Book>
}

export function getBookDatabase (dbName?: string): BookDatabaseAccessor {
  const database = client.db(dbName ?? Math.floor(Math.random() * 100000).toPrecision().toString())
  const books = database.collection<Book>('books')

  return {
    database,
    books
  }
}

// export async function getDefaultBooksDatabase (name?: string): Promise<BooksData> {
//   const db = getBookDatabase(name)
//   return new BookWarehouse(db)
// }

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest

  test('Can Setup Test DB', () => {
    const { database } = getBookDatabase()
    expect(database.databaseName, `URI: ${uri}, DB: ${database.databaseName}`).not.toEqual('mcmasterful-books')
  })
}
