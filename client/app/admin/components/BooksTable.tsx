// ─────────────────────────────────────────────────────────────────────────────
// BooksTable.tsx  –  correct API: /api/Book/GetBooks, field: coverImagePath
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Eye, Pencil, Trash2, PlusCircle, TagIcon, Loader2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { AddBookForm } from "./AddBookForm"

const BOOK_API = "https://localhost:7265/api/Book"

interface Book {
  bookId: string
  title: string
  author: string
  genre: string
  language: string
  publisher: string
  isbn: string
  publicationDate: string
  stock: number
  price: number
  offerPrice: number | null
  offerStartDate: string | null
  offerEndDate: string | null
  coverImagePath: string | null   // ← correct field name
  sellerId: string
  sellerName: string
}

interface OfferFormData {
  bookId: string
  offerPrice: number
  offerStartDate: string
  offerEndDate: string
}

export function BooksTable() {
  const router = useRouter()
  const [books, setBooks]             = useState<Book[]>([])
  const [loading, setLoading]         = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [selectedBook, setSelectedBook]   = useState<Book | null>(null)
  const [offerData, setOfferData] = useState<OfferFormData>({
    bookId: "",
    offerPrice: 0,
    offerStartDate: new Date().toISOString().slice(0, 16),
    offerEndDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  })

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${BOOK_API}/GetBooks`, {
        headers: { Authorization: `Bearer ${token}`, accept: "*/*" },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setBooks(await res.json())
    } catch (err) {
      toast.error("Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [])

  const handleDelete = async (bookId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${BOOK_API}/DeleteBook/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, accept: "*/*" },
      })
      if (!res.ok) throw new Error()
      setBooks(prev => prev.filter(b => b.bookId !== bookId))
      toast.success("Book deleted successfully")
    } catch {
      toast.error("Failed to delete book")
    }
  }

  const handleSetOffer = (book: Book) => {
    setSelectedBook(book)
    setOfferData({
      bookId: book.bookId,
      offerPrice: Math.round(book.price * 0.8),
      offerStartDate: new Date().toISOString().slice(0, 16),
      offerEndDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    })
    setShowOfferForm(true)
  }

  const handleOfferSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${BOOK_API}/SetOffer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookId: offerData.bookId,
          offerPrice: offerData.offerPrice,
          offerStartDate: new Date(offerData.offerStartDate).toISOString(),
          offerEndDate: new Date(offerData.offerEndDate).toISOString(),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Offer set successfully")
      setShowOfferForm(false)
      fetchBooks()
    } catch {
      toast.error("Failed to set offer")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
        <span className="text-sm text-gray-500">Loading books…</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Books</h2>
          <p className="text-xs text-gray-400">{books.length} total</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              <PlusCircle className="h-4 w-4" />Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>Fill in the details to add a new book.</DialogDescription>
            </DialogHeader>
            <AddBookForm onSubmit={() => { fetchBooks(); setShowAddForm(false) }} onCancel={() => setShowAddForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500">Cover</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Title</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Author</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden md:table-cell">Genre</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden lg:table-cell">ISBN</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Price</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden md:table-cell">Stock</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-400 text-sm">No books found</TableCell>
              </TableRow>
            ) : (
              books.map(book => (
                <TableRow key={book.bookId} className="hover:bg-gray-50/60">
                  <TableCell>
                    {book.coverImagePath ? (
                      <img src={book.coverImagePath} alt={book.title}
                        className="w-9 h-12 object-cover rounded-md shadow-sm"
                        onError={e => { e.currentTarget.src = "/placeholder.svg" }} />
                    ) : (
                      <div className="w-9 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-300 text-xs">N/A</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-sm max-w-[140px] truncate">{book.title}</TableCell>
                  <TableCell className="text-sm text-gray-600 hidden sm:table-cell">{book.author}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500 hidden lg:table-cell">{book.isbn}</TableCell>
                  <TableCell className="text-sm">
                    {book.offerPrice ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-rose-600 font-semibold">Rs. {book.offerPrice}</span>
                        <span className="text-xs text-gray-400 line-through">Rs. {book.price}</span>
                      </div>
                    ) : (
                      <span className="font-medium">Rs. {book.price}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      book.stock === 0 ? "bg-red-100 text-red-600" :
                      book.stock < 10  ? "bg-amber-100 text-amber-600" :
                      "bg-blue-100 text-blue-700"}`}>
                      {book.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:bg-sky-50"
                        onClick={() => router.push(`/admin/books/${book.bookId}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                        onClick={() => router.push(`/admin/books/edit/${book.bookId}`)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleSetOffer(book)}>
                        <TagIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />Confirm Deletion
                            </DialogTitle>
                            <DialogDescription>
                              Delete "{book.title}"? This cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button variant="destructive" onClick={() => handleDelete(book.bookId)}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {books.length > 5 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/books")} className="text-xs">
            View All {books.length} Books
          </Button>
        </div>
      )}

      {/* Set Offer Dialog */}
      <Dialog open={showOfferForm} onOpenChange={setShowOfferForm}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Set Special Offer</DialogTitle>
            <DialogDescription>{selectedBook && `Offer for "${selectedBook.title}"`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { id: "offerPrice", label: "Offer Price (Rs.)", type: "number", value: offerData.offerPrice, key: "offerPrice" as keyof OfferFormData },
              { id: "offerStartDate", label: "Start Date", type: "datetime-local", value: offerData.offerStartDate, key: "offerStartDate" as keyof OfferFormData },
              { id: "offerEndDate", label: "End Date", type: "datetime-local", value: offerData.offerEndDate, key: "offerEndDate" as keyof OfferFormData },
            ].map(f => (
              <div key={f.id} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={f.id} className="text-right text-sm">{f.label}</Label>
                <Input id={f.id} type={f.type} value={f.value}
                  onChange={e => setOfferData({ ...offerData, [f.key]: f.type === "number" ? parseFloat(e.target.value) : e.target.value })}
                  className="col-span-3" />
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleOfferSubmit} className="bg-blue-600 hover:bg-blue-700">Set Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}