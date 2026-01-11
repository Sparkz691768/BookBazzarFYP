"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertTriangle, Eye, Pencil, Trash2, Plus, Search,
  Loader2, BookOpen, RefreshCw, Tag, Users,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { isAuthenticated } from "@/lib/auth"
import { AddBookForm } from "../../admin/components/AddBookForm"
import { toast } from "react-toastify"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Book {
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
  coverImagePath: string | null
  sellerId: string
  sellerName: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => (isAuthenticated() ? localStorage.getItem("token") : null)

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminBooksPage() {
  const router = useRouter()

  const [books, setBooks] = useState<Book[]>([])
  const [filtered, setFiltered] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = getToken()
      const res = await fetch("https://localhost:7265/api/Book/GetBooks", {
        headers: {
          accept: "*/*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error(`Failed to fetch books: ${res.status} ${res.statusText}`)
      const data: Book[] = await res.json()
      setBooks(data)
      setFiltered(data)
    } catch (err: any) {
      setError(err.message || "Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [])

  // ── Search ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!search.trim()) { setFiltered(books); return }
    const q = search.toLowerCase()
    setFiltered(books.filter((b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.publisher.toLowerCase().includes(q) ||
      b.sellerName.toLowerCase().includes(q),
    ))
  }, [search, books])

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (bookId: string) => {
    try {
      setDeletingId(bookId)
      const token = getToken()
      const res = await fetch(`https://localhost:7265/api/Book/DeleteBook/${bookId}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error(`Failed to delete: ${res.status} ${res.statusText}`)
      setBooks((prev) => prev.filter((b) => b.bookId !== bookId))
      setFiltered((prev) => prev.filter((b) => b.bookId !== bookId))
      toast.success("Book deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err)
      toast.error(err.message || "Failed to delete book.")
    } finally {
      setDeletingId(null)
    }
  }

  // ── Add callback ───────────────────────────────────────────────────────────

  const handleAddBook = () => {
    setShowAddForm(false)
    fetchBooks() // refresh from server
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalStock = books.reduce((s, b) => s + b.stock, 0)
  const onOffer = books.filter((b) => b.offerPrice !== null).length
  const uniqueSellers = new Set(books.map((b) => b.sellerId)).size

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-[1400px]">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Book Management</h1>
            <p className="text-slate-500 mt-1">Manage the library's book catalogue</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchBooks} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                  <DialogDescription>Fill in the details to add a new book to the library.</DialogDescription>
                </DialogHeader>
                <AddBookForm onSubmit={handleAddBook} onCancel={() => setShowAddForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <BookOpen className="h-5 w-5 text-sky-600" />, bg: "bg-sky-100", label: "Total Books", value: books.length },
            { icon: <RefreshCw className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100", label: "Total Stock", value: totalStock },
            { icon: <Tag className="h-5 w-5 text-amber-600" />, bg: "bg-amber-100", label: "On Offer", value: onOffer },
            { icon: <Users className="h-5 w-5 text-violet-600" />, bg: "bg-violet-100", label: "Sellers", value: uniqueSellers },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 ${s.bg} rounded-xl`}>{s.icon}</div>
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Table card ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg">All Books</CardTitle>
                <CardDescription>{filtered.length} {filtered.length === 1 ? "book" : "books"} found</CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search title, author, ISBN, seller…"
                  className="pl-9 w-full sm:w-[300px] bg-slate-50 border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16 gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading books…</p>
              </div>
            ) : error ? (
              <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-5 w-5" /> Error loading books
                </div>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="pl-6 font-semibold text-slate-600">Book</TableHead>
                      <TableHead className="font-semibold text-slate-600">Author</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-slate-600">Genre</TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold text-slate-600">ISBN</TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold text-slate-600">Publisher</TableHead>
                      <TableHead className="hidden xl:table-cell font-semibold text-slate-600">Price</TableHead>
                      <TableHead className="hidden xl:table-cell font-semibold text-slate-600">Stock</TableHead>
                      <TableHead className="hidden xl:table-cell font-semibold text-slate-600">Seller</TableHead>
                      <TableHead className="hidden 2xl:table-cell font-semibold text-slate-600">Published</TableHead>
                      <TableHead className="text-right pr-6 font-semibold text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-16 text-slate-400">
                          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p>{search ? "No books match your search" : "No books found"}</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((book) => (
                        <TableRow key={book.bookId} className="hover:bg-slate-50/70 transition-colors">

                          {/* Book cover + title */}
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              {book.coverImagePath ? (
                                <img
                                  src={book.coverImagePath}
                                  alt={book.title}
                                  className="w-9 h-12 object-cover rounded shadow-sm border border-slate-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center rounded flex-shrink-0">
                                  <BookOpen className="h-4 w-4 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 leading-tight line-clamp-1">{book.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">ID: {book.bookId.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-slate-700">{book.author}</TableCell>

                          <TableCell className="hidden md:table-cell">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {book.genre}
                            </span>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell font-mono text-xs text-slate-600">{book.isbn}</TableCell>

                          <TableCell className="hidden lg:table-cell text-slate-600 max-w-[140px] truncate" title={book.publisher}>
                            {book.publisher}
                          </TableCell>

                          {/* Price + offer */}
                          <TableCell className="hidden xl:table-cell">
                            <div className="space-y-0.5">
                              <p className={`font-semibold text-sm ${book.offerPrice ? "line-through text-slate-400" : "text-slate-900"}`}>
                                {formatPrice(book.price)}
                              </p>
                              {book.offerPrice && (
                                <p className="text-xs font-bold text-blue-600">{formatPrice(book.offerPrice)}</p>
                              )}
                            </div>
                          </TableCell>

                          {/* Stock */}
                          <TableCell className="hidden xl:table-cell">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${book.stock === 0
                                ? "bg-red-100 text-red-700 border-red-200"
                                : book.stock < 10
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                              }`}>
                              {book.stock === 0 ? "Out of stock" : `${book.stock} left`}
                            </span>
                          </TableCell>

                          {/* Seller */}
                          <TableCell className="hidden xl:table-cell text-slate-600 text-sm">{book.sellerName}</TableCell>

                          {/* Published */}
                          <TableCell className="hidden 2xl:table-cell text-slate-500 text-sm">
                            {formatDate(book.publicationDate)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end items-center gap-1">
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => router.push(`/admin/books/${book.bookId}`)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => router.push(`/admin/books/edit/${book.bookId}`)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                title="Edit book"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    title="Delete book"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                      <AlertTriangle className="h-5 w-5" /> Delete Book
                                    </DialogTitle>
                                    <DialogDescription>
                                      Permanently delete <strong>"{book.title}"</strong>? This cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {/* Book preview */}
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 my-1">
                                    {book.coverImagePath ? (
                                      <img src={book.coverImagePath} alt={book.title} className="w-10 h-14 object-cover rounded border border-slate-200" />
                                    ) : (
                                      <div className="w-10 h-14 bg-slate-100 flex items-center justify-center rounded">
                                        <BookOpen className="h-4 w-4 text-slate-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium text-slate-900">{book.title}</p>
                                      <p className="text-xs text-slate-500">by {book.author}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{book.genre} · {formatPrice(book.price)}</p>
                                    </div>
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDelete(book.bookId)}
                                      disabled={deletingId === book.bookId}
                                    >
                                      {deletingId === book.bookId ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
                                      ) : "Delete Book"}
                                    </Button>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}