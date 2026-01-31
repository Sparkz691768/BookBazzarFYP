"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Calendar, Phone, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserDetails } from "@/types/feedback"
import Image from "next/image"

interface UserDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userDetails: UserDetails | null
  formatDate: (dateString: string) => string
  isLoading?: boolean
}

export function UserDetailsDialog({ 
  open, 
  onOpenChange, 
  userDetails, 
  formatDate, 
  isLoading = false 
}: UserDetailsDialogProps) {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!userDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load user details</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-blue-100">
              {userDetails.profileImagePath ? (
                <Image
                  src={userDetails.profileImagePath}
                  alt={`${userDetails.name}'s avatar`}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{userDetails.name}</h3>
              <p className="text-sm text-gray-500">{userDetails.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{userDetails.email}</p>
              </div>
            </div>

            {userDetails.contactNo && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p>{userDetails.contactNo}</p>
                </div>
              </div>
            )}

            {userDetails.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p>{userDetails.address}</p>
                </div>
              </div>
            )}

            {userDetails.role && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="capitalize">{userDetails.role}</p>
                </div>
              </div>
            )}

            {userDetails.createdAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p>{formatDate(userDetails.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
