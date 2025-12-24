"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Filter } from "lucide-react"
import { ToastContainer } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"

import { BookHeader }     from "./components/BookHeader"
import { BookList }       from "./components/BookList"
import { MobileFilters }  from "./components/MobileFilters"
import { DesktopFilters } from "./components/DesktopFilters"
import { NoResults }      from "./components/NoResults"
import { useBookSearch }  from "@/hooks/useBookSearch"

export default function BookPage() {
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const {
    searchResults,
    featuredBooks,
    loading,
    searchTitle,  setSearchTitle,
    searchGenre,  setSearchGenre,
    searchAuthor, setSearchAuthor,
    sortBy,       setSortBy,
    genres,
    handleSearch,
    resetSearch,
    addToWishlist,
  } = useBookSearch( router)

  return (
    <div className="min-h-screen bg-gray-50">
      <BookHeader />

      <main className="container mx-auto py-8 px-4">

        {/* Mobile filter toggle */}
        <div className="md:hidden mb-6">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters & Search</span>
              </Button>
            </SheetTrigger>
            <MobileFilters
              searchTitle={searchTitle}   setSearchTitle={setSearchTitle}
              searchAuthor={searchAuthor} setSearchAuthor={setSearchAuthor}
              searchGenre={searchGenre}   setSearchGenre={setSearchGenre}
              sortBy={sortBy}             setSortBy={setSortBy}
              genres={genres}
              handleSearch={handleSearch}
              resetSearch={resetSearch}
              setIsFilterOpen={setIsFilterOpen}
            />
          </Sheet>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Desktop sidebar */}
          <DesktopFilters
            searchTitle={searchTitle}   setSearchTitle={setSearchTitle}
            searchAuthor={searchAuthor} setSearchAuthor={setSearchAuthor}
            searchGenre={searchGenre}   setSearchGenre={setSearchGenre}
            sortBy={sortBy}             setSortBy={setSortBy}
            genres={genres}
            handleSearch={handleSearch}
            resetSearch={resetSearch}
          />

          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Books</h1>
              <p className="text-sm text-gray-600">
                {loading ? "Loading..." : `${searchResults.length} books found`}
              </p>
            </div>

            {/* Featured / On-Sale Books */}
            {featuredBooks.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-blue-800">Featured Books</h2>
                  <Link href="/featured" className="text-sm text-blue-600 hover:underline">
                    View all
                  </Link>
                </div>
                <BookList
                  books={featuredBooks.slice(0, 4)}
                  loading={loading}
                  skeletonCount={4}
                  addToWishlist={addToWishlist}
                />
              </section>
            )}

            {/* All Books */}
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-6">All Books</h2>

              {loading ? (
                <BookList loading books={[]} skeletonCount={8} addToWishlist={addToWishlist} />
              ) : searchResults.length > 0 ? (
                <BookList books={searchResults} loading={false} addToWishlist={addToWishlist} />
              ) : (
                <NoResults resetSearch={resetSearch} />
              )}
            </section>
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}// Loading skeleton states added
