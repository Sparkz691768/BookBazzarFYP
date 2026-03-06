export interface Book {
  bookId: string
  title: string
  description: string
  stock: number
  author: string
  genre: string
  language: string
  isbn: string
  publisher: string
  publicationDate: string
  price: number
  offerPrice: number | null
  offerStartDate: string | null  // ✅ add
  offerEndDate: string | null    // ✅ add
  coverImagePath: string | null
  sellerId: string
  sellerName: string
}
