"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BooksTable } from "./BooksTable"
import { MembersTable } from "./MembersTable"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function DataTables() {
  return (
    <>
      <Tabs defaultValue="books">
        <TabsList className="bg-white border border-gray-100 shadow-sm rounded-xl p-1 gap-1">
          <TabsTrigger value="books"
            className="rounded-lg text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4">
            Books
          </TabsTrigger>
          <TabsTrigger value="members"
            className="rounded-lg text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4">
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-4">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
            <CardContent className="pt-6 px-4 sm:px-6">
              <BooksTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
            <CardContent className="pt-6 px-4 sm:px-6">
              <MembersTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  )
}