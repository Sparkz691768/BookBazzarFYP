// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"

// export default function AddBookPage() {
//   const router = useRouter()
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [formData, setFormData] = useState({
//     title: "",
//     author: "",
//     description: "",
//     genre: "",
//     language: "",
//     publisher: "",
//     isbn: "",
//     publicationDate: "",
//     price: 0,
//     stock: 0,
//   })
//   const [coverImage, setCoverImage] = useState<File | null>(null)

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData({
//       ...formData,
//       [name]: name === "price" || name === "stock" ? Number(value) : value,
//     })
//   }

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     })
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setCoverImage(e.target.files[0])
//     }
//   }

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()

//     if (!validateForm()) {
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       // Create FormData object for multipart/form-data submission
//       const formDataToSubmit = new FormData()

//       // Add all text fields
//       formDataToSubmit.append("Title", formData.title)
//       formDataToSubmit.append("Author", formData.author)
//       formDataToSubmit.append("Description", formData.description)
//       formDataToSubmit.append("Genre", formData.genre)
//       formDataToSubmit.append("Language", formData.language)
//       formDataToSubmit.append("Publisher", formData.publisher)
//       formDataToSubmit.append("ISBN", formData.isbn)
//       formDataToSubmit.append("PublicationDate", formData.publicationDate)
//       formDataToSubmit.append("Price", formData.price.toString())
//       formDataToSubmit.append("Stock", formData.stock.toString())

//       // Add cover image if available
//       if (coverImage) {
//         formDataToSubmit.append("CoverImage", coverImage)
//       }

//       // Submit to API using axios
//       const response = await axios.post("https://localhost:7265/AddBook", formDataToSubmit, {
//         headers: {
//           accept: "*/*",
//           "Content-Type": "multipart/form-data",
//         },
//       })

//       console.log("Book added successfully:", response.data)

//       // Call the onSubmit callback to update the UI
//       onSubmit(formData)
//     } catch (error) {
//       console.error("Error submitting form:", error)
//       setErrors({
//         form: "An error occurred while submitting the form. Please try again.",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Common genres for books
//   const genres = [
//     "Fiction",
//     "Non-Fiction",
//     "Science Fiction",
//     "Fantasy",
//     "Mystery",
//     "Thriller",
//     "Romance",
//     "Horror",
//     "Biography",
//     "History",
//     "Self-Help",
//     "Business",
//     "Children's",
//     "Young Adult",
//     "Poetry",
//   ]

//   // Common languages
//   const languages = [
//     "English",
//     "Spanish",
//     "French",
//     "German",
//     "Italian",
//     "Chinese",
//     "Japanese",
//     "Russian",
//     "Arabic",
//     "Portuguese",
//   ]

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       <div className="flex items-center gap-2">
//         <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
//           <ArrowLeft className="h-4 w-4" />
//         </Button>
//         <h1 className="text-2xl font-bold">Add New Book</h1>
//       </div>

//       <Card>
//         <form onSubmit={handleSubmit}>
//           <CardHeader>
//             <CardTitle>Book Information</CardTitle>
//             <CardDescription>Enter the details for the new book.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="h-5 w-5" />
//                   <p className="font-medium">Error</p>
//                 </div>
//                 <p className="mt-1 text-sm">{error}</p>
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="coverImage">Cover Image</Label>
//               <Input id="coverImage" name="coverImage" type="file" accept="image/*" onChange={handleFileChange} />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="title" className="required">
//                   Title
//                 </Label>
//                 <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="author" className="required">
//                   Author
//                 </Label>
//                 <Input id="author" name="author" value={formData.author} onChange={handleInputChange} required />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="genre" className="required">
//                   Genre
//                 </Label>
//                 <Select value={formData.genre} onValueChange={(value) => handleSelectChange("genre", value)}>
//                   <SelectTrigger id="genre">
//                     <SelectValue placeholder="Select genre" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {genres.map((genre) => (
//                       <SelectItem key={genre} value={genre}>
//                         {genre}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="language" className="required">
//                   Language
//                 </Label>
//                 <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
//                   <SelectTrigger id="language">
//                     <SelectValue placeholder="Select language" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {languages.map((language) => (
//                       <SelectItem key={language} value={language}>
//                         {language}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="publisher" className="required">
//                   Publisher
//                 </Label>
//                 <Input
//                   id="publisher"
//                   name="publisher"
//                   value={formData.publisher}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="isbn" className="required">
//                   ISBN
//                 </Label>
//                 <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleInputChange} required />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="publicationDate" className="required">
//                   Publication Date
//                 </Label>
//                 <Input
//                   id="publicationDate"
//                   name="publicationDate"
//                   type="date"
//                   value={formData.publicationDate}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="price" className="required">
//                   Price
//                 </Label>
//                 <Input
//                   id="price"
//                   name="price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={formData.price}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="stock" className="required">
//                   Stock
//                 </Label>
//                 <Input
//                   id="stock"
//                   name="stock"
//                   type="number"
//                   min="0"
//                   step="1"
//                   value={formData.stock}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="description" className="required">
//                   Description
//                 </Label>
//                 <Textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={5}
//                   required
//                 />
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter className="flex justify-between border-t p-6">
//             <Button type="button" variant="outline" onClick={() => router.back()}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={saving}>
//               {saving ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 "Add Book"
//               )}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   )
// }
