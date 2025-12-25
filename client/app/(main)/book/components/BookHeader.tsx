import Link from "next/link"

export function BookHeader() {
  return (
    <div className="bg-white border-b max-w-7xl">
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-blue-600">Books</span>
        </div>
      </div>
    </div>
  )
}
