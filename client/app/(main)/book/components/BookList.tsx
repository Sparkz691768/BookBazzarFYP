import { BookCard } from "./BookCard"
import { BookCardSkeleton } from "./BookCardSkeleton"
import type { Book } from "@/types/book"  // ✅ single type

interface BookListProps {
  books: Book[]
  loading: boolean
  skeletonCount?: number
  addToWishlist: (bookId: string) => Promise<void>
}

export function BookList({ books, loading, skeletonCount = 8, addToWishlist }: BookListProps) {
  if (loading) {
    return (
      <div className="grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array(skeletonCount).fill(0).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-5 max-w-7xl mx-auto">
      {books.map((book) => (
        <BookCard key={book.bookId} book={book} addToWishlist={addToWishlist} />
      ))}
    </div>
  )
}