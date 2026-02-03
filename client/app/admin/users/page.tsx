"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  Loader2,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  Users,
  UserCheck,
  RefreshCw,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string
  name: string
  email: string
  address: string
  contactNo: string
  profileImageUrl: string | null
  createdDate: string
  roles: string[]
}

// Available roles in your system – extend as needed
const ALL_ROLES = ["Admin", "User", "Moderator", "Editor", "Viewer"]

const ROLE_COLORS: Record<string, string> = {
  Admin:     "bg-rose-100 text-rose-700 border-rose-200",
  Moderator: "bg-violet-100 text-violet-700 border-violet-200",
  Editor:    "bg-amber-100 text-amber-700 border-amber-200",
  User:      "bg-sky-100 text-sky-700 border-sky-200",
  Viewer:    "bg-blue-100 text-blue-700 border-blue-200",
}

const getRoleClass = (role: string) =>
  ROLE_COLORS[role] ?? "bg-slate-100 text-slate-700 border-slate-200"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "U")

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsersPage() {
  const router = useRouter()

  const [users, setUsers]               = useState<User[]>([])
  const [filteredUsers, setFiltered]    = useState<User[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [searchQuery, setSearch]        = useState("")
  const [isDeleting, setIsDeleting]     = useState(false)
  const [deletingId, setDeletingId]     = useState<string | null>(null)

  // Role editing state
  const [roleDialogUser, setRoleDialogUser]       = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles]         = useState<string[]>([])
  const [isSavingRoles, setIsSavingRoles]         = useState(false)

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = isAuthenticated() ? localStorage.getItem("token") : null
      const response = await fetch("https://localhost:7265/get-all-users", {
        headers: {
          accept: "*/*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`)
      const data: User[] = await response.json()
      setUsers(data)
      setFiltered(data)
    } catch (err: any) {
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  // ── Search filter ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim()) { setFiltered(users); return }
    const q = searchQuery.toLowerCase()
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.contactNo.includes(q) ||
          u.address.toLowerCase().includes(q) ||
          u.roles.some((r) => r.toLowerCase().includes(q)),
      ),
    )
  }, [searchQuery, users])

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (userId: string) => {
    try {
      setIsDeleting(true)
      setDeletingId(userId)
      const token = isAuthenticated() ? localStorage.getItem("token") : null

      // Uncomment and adapt for your real endpoint:
      // const response = await fetch(`https://localhost:7265/delete-user/${userId}`, {
      //   method: "DELETE",
      //   headers: { accept: "*/*", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      // })
      // if (!response.ok) throw new Error(`Failed to delete: ${response.statusText}`)

      await new Promise((r) => setTimeout(r, 900)) // simulate

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setFiltered((prev) => prev.filter((u) => u.id !== userId))
    } catch (err: any) {
      console.error("Error deleting user:", err)
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  // ── Role management ───────────────────────────────────────────────────────

  const openRoleDialog = (user: User) => {
    setRoleDialogUser(user)
    setSelectedRoles([...user.roles])
  }

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  const handleSaveRoles = async () => {
    if (!roleDialogUser) return
    try {
      setIsSavingRoles(true)
      const token = isAuthenticated() ? localStorage.getItem("token") : null

      // Uncomment and adapt for your real endpoint:
      // const response = await fetch(`https://localhost:7265/update-user-roles/${roleDialogUser.id}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     accept: "*/*",
      //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
      //   },
      //   body: JSON.stringify({ roles: selectedRoles }),
      // })
      // if (!response.ok) throw new Error(`Failed to update roles: ${response.statusText}`)

      await new Promise((r) => setTimeout(r, 800)) // simulate

      // Update local state
      const updated = users.map((u) =>
        u.id === roleDialogUser.id ? { ...u, roles: selectedRoles } : u,
      )
      setUsers(updated)
      setFiltered(updated.filter((u) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.roles.some((r) => r.toLowerCase().includes(q))
        )
      }))
      setRoleDialogUser(null)
    } catch (err: any) {
      console.error("Error saving roles:", err)
    } finally {
      setIsSavingRoles(false)
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalAdmins = users.filter((u) => u.roles.includes("Admin")).length

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-[1400px]">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-slate-500 mt-1">Manage users, roles, and account information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => router.push("/admin/users/add")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-sky-100 rounded-xl">
                <Users className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Admins</p>
                <p className="text-2xl font-bold text-slate-900">{totalAdmins}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Search Results</p>
                <p className="text-2xl font-bold text-slate-900">{filteredUsers.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Table card ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg">All Users</CardTitle>
                <CardDescription>
                  {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search by name, email, role..."
                  className="pl-9 w-full sm:w-[280px] bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16 gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading users...</p>
              </div>
            ) : error ? (
              <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-5 w-5" />
                  Error loading users
                </div>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="pl-6 font-semibold text-slate-600">User</TableHead>
                      <TableHead className="font-semibold text-slate-600">Email</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Contact</span>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Address</span>
                      </TableHead>
                      <TableHead className="hidden xl:table-cell font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Joined</span>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Roles</span>
                      </TableHead>
                      <TableHead className="text-right pr-6 font-semibold text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p>{searchQuery ? "No users match your search" : "No users found"}</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-slate-50/70 transition-colors">

                          {/* User */}
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-slate-200">
                                <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white text-sm font-semibold">
                                  {getInitial(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-900 leading-none">{user.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-[120px]">{user.id.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Email */}
                          <TableCell className="text-slate-700">{user.email}</TableCell>

                          {/* Contact */}
                          <TableCell className="hidden md:table-cell text-slate-600">{user.contactNo}</TableCell>

                          {/* Address */}
                          <TableCell className="hidden lg:table-cell text-slate-600 max-w-[180px]">
                            <span className="truncate block" title={user.address}>{user.address}</span>
                          </TableCell>

                          {/* Joined */}
                          <TableCell className="hidden xl:table-cell text-slate-500 text-sm">
                            {formatDate(user.createdDate)}
                          </TableCell>

                          {/* Roles */}
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {user.roles.length === 0 ? (
                                <span className="text-xs text-slate-400 italic">No roles</span>
                              ) : (
                                user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleClass(role)}`}
                                  >
                                    {role}
                                  </span>
                                ))
                              )}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end items-center gap-1">

                              {/* View */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {/* Edit */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                title="Edit user"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Manage Roles */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRoleDialog(user)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-violet-600 hover:bg-violet-50"
                                title="Manage roles"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </Button>

                              {/* Delete */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                      <AlertTriangle className="h-5 w-5" />
                                      Delete User
                                    </DialogTitle>
                                    <DialogDescription className="pt-2">
                                      Are you sure you want to permanently delete{" "}
                                      <span className="font-semibold text-slate-900">"{user.name}"</span>?
                                      This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>

                                  {/* User preview inside dialog */}
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 my-1">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.name} />
                                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-semibold">
                                        {getInitial(user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-slate-900">{user.name}</p>
                                      <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                  </div>

                                  <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDelete(user.id)}
                                      disabled={isDeleting && deletingId === user.id}
                                    >
                                      {isDeleting && deletingId === user.id ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
                                      ) : (
                                        "Delete User"
                                      )}
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

      {/* ── Role Management Dialog ── */}
      <Dialog open={!!roleDialogUser} onOpenChange={(open) => !open && setRoleDialogUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-500" />
              Manage Roles
            </DialogTitle>
            <DialogDescription>
              Update roles for{" "}
              <span className="font-semibold text-slate-900">{roleDialogUser?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {/* User info */}
          {roleDialogUser && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Avatar className="h-10 w-10">
                <AvatarImage src={roleDialogUser.profileImageUrl ?? undefined} alt={roleDialogUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-semibold">
                  {getInitial(roleDialogUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900">{roleDialogUser.name}</p>
                <p className="text-xs text-slate-500">{roleDialogUser.email}</p>
              </div>
            </div>
          )}

          {/* Role checkboxes */}
          <div className="space-y-2 py-1">
            <p className="text-sm font-medium text-slate-700 mb-3">Available Roles</p>
            {ALL_ROLES.map((role) => (
              <div
                key={role}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => toggleRole(role)}
              >
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                />
                <Label htmlFor={`role-${role}`} className="flex-1 cursor-pointer flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleClass(role)}`}
                  >
                    {role}
                  </span>
                </Label>
              </div>
            ))}
          </div>

          {selectedRoles.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              User will have no roles assigned.
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRoleDialogUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={isSavingRoles} className="min-w-[120px]">
              {isSavingRoles ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              ) : (
                "Save Roles"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}