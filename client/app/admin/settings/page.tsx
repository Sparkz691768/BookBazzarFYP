"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 border-b w-full justify-start rounded-none bg-transparent">
          <TabsTrigger value="general" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent">General</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Library Profile</CardTitle>
              <CardDescription>
                Update your application name, branding, and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="BookBazzar LibraryHub" disabled />
                <p className="text-[12px] text-muted-foreground mt-1">This module is under development and is read-only.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Support Email</Label>
                <Input id="contactEmail" defaultValue="admin@libraryhub.com" disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                View system status and configuration options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-lg">
                <h3 className="font-medium text-sm mb-2">Backend Connection</h3>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Connected (localhost:7265)
                </div>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg">
                <h3 className="font-medium text-sm mb-2">Frontend Version</h3>
                <p className="text-sm text-muted-foreground">v1.0.0 (Next.js)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
