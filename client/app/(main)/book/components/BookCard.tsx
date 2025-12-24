"use client"

import { useRouter } from "next/navigation"
import { BookOpen, Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Book } from "@/types/book"
import Image from "next/image"

interface BookCardProps {
  book: Book
  addToWishlist: (bookId: string) => Promise<void>
}

export function BookCard({ book, addToWishlist }: BookCardProps) {
  const router = useRouter()

  // ✅ Show offer if offerPrice is set (dates are optional)
  const isOfferActive =
    book.offerPrice != null && (
      // If dates are set, check if we're within the offer period
      book.offerStartDate && book.offerEndDate
        ? new Date() >= new Date(book.offerStartDate) && new Date() <= new Date(book.offerEndDate)
        : true // If dates are null, show offer immediately
    )

  const displayPrice = isOfferActive ? book.offerPrice! : book.price
  const hasValidImage = book.coverImagePath?.startsWith("http")

  return (
    <Card className="flex flex-col h-fit w-[220px] overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="aspect-[3/4] relative overflow-hidden">
        {hasValidImage ? (
          <Image
            src={book.coverImagePath!}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, 220px"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder-book.png"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* ✅ Only show Sale badge if offer is truly active */}
        {isOfferActive && (
          <Badge className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700">Sale</Badge>
        )}
        {book.stock > 0 && book.stock < 10 && (
          <Badge className="absolute top-2 right-2 bg-amber-600 hover:bg-amber-700">Low Stock</Badge>
        )}
      </div>

      <CardContent className="p-4 flex-grow">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
        <p className="text-xs text-gray-500 mb-2">
          {book.publisher} • {book.language}
        </p>

        <div className="flex mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
          ))}
        </div>

        {isOfferActive ? (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-rose-600">Rs. {book.offerPrice}</p>
            <p className="text-sm text-gray-500 line-through">Rs. {book.price}</p>
            <Badge variant="outline" className="text-rose-600 border-rose-200">
              {Math.round(((book.price - book.offerPrice!) / book.price) * 100)}% off
            </Badge>
          </div>
        ) : (
          <p className="font-bold">Rs. {book.price}</p>
        )}

        {book.stock === 0 && (
          <Badge variant="outline" className="mt-2 w-full justify-center text-red-600 border-red-200">
            Out of Stock
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 w-full"
            onClick={() => router.push(`/book/${book.bookId}`)}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => addToWishlist(book.bookId)}
            disabled={book.stock === 0}
          >
            Add to Wishlist
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}