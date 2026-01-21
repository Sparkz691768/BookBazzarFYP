// ─────────────────────────────────────────────────────────────────────────────
// MembersTable.tsx  –  correct API: /get-all-users, field: profileImageUrl
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Eye, Trash2, PlusCircle, Loader2, Phone, Mail, MapPin, ShieldCheck } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader,
  SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet"
import { toast } from "react-toastify"

interface User {
  id: string
  name: string
  email: string
  address: string
  contactNo: string
  profileImageUrl: string | null   // ← correct field name from API
  emailConfirmed: boolean
  roles: string[]
  createdDate: string
}

export function MembersTable() {
  const router = useRouter()
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch("https://localhost:7265/get-all-users", {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setMembers(await res.json())
    } catch {
      toast.error("Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const handleDelete = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`https://localhost:7265/delete-user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, accept: "*/*" },
      })
      if (!res.ok) throw new Error()
      setMembers(prev => prev.filter(m => m.id !== userId))
      toast.success("User deleted successfully")
    } catch {
      toast.error("Failed to delete user")
    }
  }

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() ?? "U"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
        <span className="text-sm text-gray-500">Loading members…</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Members</h2>
          <p className="text-xs text-gray-400">
            {members.length} total · {members.filter(m => m.emailConfirmed).length} verified
          </p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          onClick={() => router.push("/admin/users/add")}>
          <PlusCircle className="h-4 w-4" />Add Member
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500">Member</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden md:table-cell">Contact</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden lg:table-cell">Address</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 hidden sm:table-cell">Role</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400 text-sm">No members found</TableCell>
              </TableRow>
            ) : (
              members.map(member => (
                <TableRow key={member.id} className="hover:bg-gray-50/60">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 ring-2 ring-offset-1 ring-gray-100">
                        <AvatarImage src={member.profileImageUrl ?? "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                          {getInitial(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                        {member.emailConfirmed && (
                          <p className="text-xs text-blue-600 flex items-center gap-0.5">
                            <ShieldCheck className="h-3 w-3" />Verified
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden sm:table-cell">{member.email}</TableCell>
                  <TableCell className="text-sm text-gray-600 hidden md:table-cell">{member.contactNo}</TableCell>
                  <TableCell className="text-sm text-gray-500 hidden lg:table-cell max-w-[180px] truncate">
                    {member.address}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {member.roles?.map(r => (
                      <Badge key={r} variant="outline"
                        className={`text-xs ${r === "Admin" ? "border-violet-300 text-violet-700 bg-violet-50" : "border-sky-300 text-sky-700 bg-sky-50"}`}>
                        {r}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {/* View Sheet */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:bg-sky-50">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-white w-80 sm:w-96">
                          <SheetHeader>
                            <SheetTitle>Member Details</SheetTitle>
                            <SheetDescription>{member.name}</SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-5">
                            <div className="flex justify-center">
                              <Avatar className="h-20 w-20 ring-4 ring-offset-2 ring-indigo-100">
                                <AvatarImage src={member.profileImageUrl ?? "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                                  {getInitial(member.name)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <div className="flex justify-center gap-1 mt-1 flex-wrap">
                                {member.roles?.map(r => (
                                  <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                              {[
                                { icon: Mail, label: member.email },
                                { icon: Phone, label: member.contactNo },
                                { icon: MapPin, label: member.address },
                              ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-start gap-2.5">
                                  <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 break-all">{label}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 mb-0.5">User ID</p>
                              <p className="font-mono text-xs text-gray-600 break-all">{member.id}</p>
                            </div>
                          </div>
                          <div className="mt-6">
                            <SheetClose asChild>
                              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Close</Button>
                            </SheetClose>
                          </div>
                        </SheetContent>
                      </Sheet>

                      {/* Delete */}
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
                              Delete "{member.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button variant="destructive" onClick={() => handleDelete(member.id)}>Delete</Button>
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

      {members.length > 5 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/users")} className="text-xs">
            View All {members.length} Members
          </Button>
        </div>
      )}
    </div>
  )
}