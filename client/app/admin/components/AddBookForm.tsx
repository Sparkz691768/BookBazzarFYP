"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"

interface Book {
  title: string
  author: string
  description: string
  genre: string
  language: string
  publisher: string
  isbn: string
  publicationDate: string
  price: number
  stock: number
  coverImagePath: string | null
}

interface AddBookFormProps {
  onSubmit: (book: Book) => void
  onCancel: () => void
}

export function AddBookForm({ onSubmit, onCancel }: AddBookFormProps) {
  const [formData, setFormData] = useState<Book>({
    title: "",
    author: "",
    description: "",
    genre: "",
    language: "",
    publisher: "",
    isbn: "",
    publicationDate: "",
    price: 0,
    stock: 0,
    coverImagePath: null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0])

      // In a real app, you would upload the file to a server and get a URL back
      // For now, we'll create a temporary URL
      const fileUrl = URL.createObjectURL(e.target.files[0])
      setFormData({
        ...formData,
        coverImagePath: fileUrl,
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.author.trim()) newErrors.author = "Author is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.genre.trim()) newErrors.genre = "Genre is required"
    if (!formData.language.trim()) newErrors.language = "Language is required"
    if (!formData.publisher.trim()) newErrors.publisher = "Publisher is required"
    if (!formData.isbn.trim()) newErrors.isbn = "ISBN is required"
    if (!formData.publicationDate.trim()) newErrors.publicationDate = "Publication date is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return

  setIsSubmitting(true)

  try {
    const formDataToSubmit = new FormData()

    formDataToSubmit.append("Title", formData.title)
    formDataToSubmit.append("Author", formData.author)
    formDataToSubmit.append("Description", formData.description)
    formDataToSubmit.append("Genre", formData.genre)
    formDataToSubmit.append("Language", formData.language)
    formDataToSubmit.append("Publisher", formData.publisher)
    formDataToSubmit.append("ISBN", formData.isbn)
    formDataToSubmit.append("PublicationDate", formData.publicationDate)
    formDataToSubmit.append("Price", formData.price.toString())
    formDataToSubmit.append("Stock", formData.stock.toString())

    if (coverImage) {
      formDataToSubmit.append("CoverImage", coverImage)
    }

    const token = localStorage.getItem("token")

    const response = await axios.post(
      "https://localhost:7265/api/Book/AddBook",
      formDataToSubmit,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    )

    console.log("Book added successfully:", response.data)

    onSubmit(formData)
  } catch (error: any) {
    console.error("Error submitting form:", error)

    if (error.response?.status === 401) {
      setErrors({ form: "You must be logged in as a seller to add books." })
    } else {
      setErrors({
        form: error.response?.data || "Failed to add book. Please try again.",
      })
    }
  } finally {
    setIsSubmitting(false)
  }
}

  // Common genres for books
  const genres = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Thriller",
    "Romance",
    "Horror",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Children's",
    "Young Adult",
    "Poetry",
  ]

  // Common languages
  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Chinese",
    "Japanese",
    "Russian",
    "Arabic",
    "Portuguese",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white">
      {errors.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="grid bg-white grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="required">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author" className="required">
            Author
          </Label>
          <Input
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className={errors.author ? "border-red-500" : ""}
          />
          {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label htmlFor="genre" className="required">
            Genre
          </Label>
          <Select value={formData.genre} onValueChange={(value) => handleSelectChange("genre", value)}>
            <SelectTrigger id="genre" className={errors.genre ? "border-red-500" : ""}>
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.genre && <p className="text-sm text-red-500">{errors.genre}</p>}
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language" className="required">
            Language
          </Label>
          <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
            <SelectTrigger id="language" className={errors.language ? "border-red-500" : ""}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && <p className="text-sm text-red-500">{errors.language}</p>}
        </div>

        {/* Publisher */}
        <div className="space-y-2">
          <Label htmlFor="publisher" className="required">
            Publisher
          </Label>
          <Input
            id="publisher"
            name="publisher"
            value={formData.publisher}
            onChange={handleInputChange}
            className={errors.publisher ? "border-red-500" : ""}
          />
          {errors.publisher && <p className="text-sm text-red-500">{errors.publisher}</p>}
        </div>

        {/* ISBN */}
        <div className="space-y-2">
          <Label htmlFor="isbn" className="required">
            ISBN
          </Label>
          <Input
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleInputChange}
            className={errors.isbn ? "border-red-500" : ""}
          />
          {errors.isbn && <p className="text-sm text-red-500">{errors.isbn}</p>}
        </div>

        {/* Publication Date */}
        <div className="space-y-2">
          <Label htmlFor="publicationDate" className="required">
            Publication Date
          </Label>
          <Input
            id="publicationDate"
            name="publicationDate"
            type="date"
            value={formData.publicationDate}
            onChange={handleInputChange}
            className={errors.publicationDate ? "border-red-500" : ""}
          />
          {errors.publicationDate && <p className="text-sm text-red-500">{errors.publicationDate}</p>}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="required">
            Price
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock" className="required">
            Stock
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleInputChange}
            className={errors.stock ? "border-red-500" : ""}
          />
          {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image</Label>
          <Input id="coverImage" name="coverImage" type="file" accept="image/*" onChange={handleFileChange} />
          {formData.coverImagePath && (
            <div className="mt-2">
              <img
                src={formData.coverImagePath || "/placeholder.svg"}
                alt="Book cover preview"
                className="w-20 h-28 object-cover border rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Description - Full width */}
      <div className="space-y-2">
        <Label htmlFor="description" className="required">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add Book"}
        </Button>
      </div>
    </form>
  )
}
