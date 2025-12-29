"use client"

import { BookOpen, Star, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Book {
  id: string
  title: string
  author: string
  price: number
  originalPrice?: number
  discount?: number
  rating?: number
  description?: string
  specialDeal?: string
}

export default function BookDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const fetchBook = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
        
        const sampleBooks: Book[] = [
          { 
            id: "1", 
            title: "The Mountain's Echo", 
            author: "Sarah Matthews", 
            price: 1499,
            originalPrice: 1999,
            discount: 25,
            rating: 245,
            description: "A compelling story of adventure and self-discovery set in the Himalayas. Written by acclaimed author Sarah Matthews, this book will take you on an unforgettable journey.",
            specialDeal: "Buy any 5 books and get 5% off on your purchase !!"
          },
          { id: "2", title: "Digital Dreams", author: "Alex Kumar", price: 1200 },
          { id: "3", title: "The Last Temple", author: "Ram Pradhan", price: 950 },
          { id: "4", title: "Himalayan Tales", author: "Maya Sherpa", price: 750 },
          { id: "5", title: "Urban Spirits", author: "Priya Thapa", price: 1100 },
          { id: "6", title: "Tech Revolution", author: "Rajesh Sharma", price: 1500 },
          { id: "7", title: "Valley of Dreams", author: "Sita Gurung", price: 900 },
          { id: "8", title: "Beyond Borders", author: "Aarav Patel", price: 1300 },
        ]

        const foundBook = sampleBooks.find(b => b.id === params.id)
        setBook(foundBook || null)
      } catch (error) {
        console.error("Failed to fetch book:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading book details...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book not found</h1>
          <Button onClick={() => router.push('/books')}>Back to Books</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Book Cover */}
          <div className="bg-gray-100 rounded-lg aspect-[2/3] flex items-center justify-center">
            <BookOpen className="h-32 w-32 text-gray-400" />
          </div>

          {/* Book Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-muted-foreground mb-4">by {book.author}</p>
            
            {book.rating && (
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({book.rating} reviews)</span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-2xl font-bold">NPR {book.price}</span>
              {book.originalPrice && (
                <>
                  <span className="ml-2 text-lg text-muted-foreground line-through">NPR {book.originalPrice}</span>
                  {book.discount && (
                    <span className="ml-2 text-lg font-semibold text-blue-600">{book.discount}% OFF</span>
                  )}
                </>
              )}
            </div>

            {book.specialDeal && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
                <p className="text-sm font-medium text-yellow-800">{book.specialDeal}</p>
              </div>
            )}

            {book.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">About the Book:</h2>
                <p className="text-muted-foreground">{book.description}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity:</label>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  -
                </Button>
                <div className="mx-2 text-sm">1</div>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  +
                </Button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button className="flex-1" variant="outline">
                Add to Cart
              </Button>
              <Button className="flex-1">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}