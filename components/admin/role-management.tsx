"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  UserCog,
  Shield,
  Settings,
  User,
  CheckCircle2,
  AlertCircle,
  Info,
  UserPlus,
  Key,
} from "lucide-react"

interface UserRole {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  updated_at: string
}

function getRoleBadgeVariant(role: string): "default" | "destructive" | "outline" | "secondary" {
  switch (role) {
    case "admin":
      return "destructive"
    case "user":
      return "secondary"
    default:
      return "default"
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="w-4 h-4" />
    case "manager":
      return <Settings className="w-4 h-4" />
    case "user":
      return <User className="w-4 h-4" />
    default:
      return <User className="w-4 h-4" />
  }
}

const toggleUserSelection = (userId: string, selectedUsers: Set<string>) => {
  const newSelectedUsers = new Set(selectedUsers)
  if (newSelectedUsers.has(userId)) {
    newSelectedUsers.delete(userId)
  } else {
    newSelectedUsers.add(userId)
  }
  return newSelectedUsers
}

export function RoleManagement() {
  const [users, setUsers] = useState<UserRole[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [batchRole, setBatchRole] = useState<string>("")
  const [showBatchDialog, setShowBatchDialog] = useState(false)

  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState<string>("user")
  const [creatingUser, setCreatingUser] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    console.log("[v0] RoleManagement component mounted")
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      console.log("[v0] Fetching users for role management...")
      const response = await fetch("/api/admin/roles")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to fetch users - Status:", response.status, "Error:", errorData)
        throw new Error(errorData.error || "Failed to fetch users")
      }

      const data = await response.json()
      console.log("[v0] Fetched users for role management:", data.users?.length || 0)

      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
    } catch (error) {
      console.error("[v0] Error in fetchUsers:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setNewUserPassword(password)
  }

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Validation Error",
        description: "Email and password are required",
        variant: "destructive",
      })
      return
    }

    setCreatingUser(true)
    try {
      console.log("[v0] Creating new user:", newUserEmail, "with role:", newUserRole)

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          fullName: newUserName,
          password: newUserPassword,
          role: newUserRole,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to create user - Status:", response.status, "Error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to create user")
      }

      const data = await response.json()
      console.log("[v0] User created successfully:", data.user)

      toast({
        title: "User Created",
        description: `${newUserEmail} has been added with ${newUserRole} role`,
      })

      // Reset form
      setNewUserEmail("")
      setNewUserName("")
      setNewUserPassword("")
      setNewUserRole("user")
      setShowAddUserDialog(false)

      // Refresh user list
      await fetchUsers()
    } catch (error) {
      console.error("[v0] Error creating user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleEditRole = (user: UserRole) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowEditDialog(true)
  }

  const handleConfirmEdit = () => {
    setShowEditDialog(false)
    setShowConfirmDialog(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      console.log("[v0] Updating role for user:", selectedUser.email, "to:", newRole)

      const response = await fetch(`/api/admin/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to update user role - Status:", response.status, "Error:", errorData)
        throw new Error(errorData.error || "Failed to update user role")
      }

      const data = await response.json()
      console.log("[v0] User role updated successfully:", data.user)

      toast({
        title: "Role Updated",
        description: `${selectedUser.email}'s role has been changed to ${newRole}`,
      })

      // Refresh user list
      await fetchUsers()
    } catch (error) {
      console.error("[v0] Error updating user role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setShowConfirmDialog(false)
    }
  }

  const handleBatchUpdate = async () => {
    if (!batchRole) return

    try {
      console.log("[v0] Updating roles for selected users:", selectedUsers.size, "to:", batchRole)

      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), role: batchRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to batch update user roles - Status:", response.status, "Error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to batch update user roles")
      }

      const data = await response.json()
      console.log("[v0] Batch user roles updated successfully:", data.users?.length || 0)

      toast({
        title: "Batch Role Updated",
        description: `${selectedUsers.size} user${selectedUsers.size !== 1 ? "s" : ""} have been updated to ${batchRole} role`,
      })

      // Clear selection and refresh
      setSelectedUsers(new Set())
      setBatchRole("")
      setShowBatchDialog(false)

      // Refresh user list
      await fetchUsers()
    } catch (error) {
      console.error("[v0] Error batch updating user roles:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to batch update user roles",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    let filtered = users

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    console.log(`[v0] Filtered ${filtered.length} users from ${users.length} total`)
    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>User Role Management Guide</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className="font-semibold">How to Use This Feature:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>
              <strong>Add New User:</strong> Click "Add User" to create a new account with name, email, and password
            </li>
            <li>
              <strong>Search Users:</strong> Use the search bar to find users by name or email address
            </li>
            <li>
              <strong>Filter by Role:</strong> Select a role from the dropdown to view only users with that role
            </li>
            <li>
              <strong>Edit Individual Role:</strong> Click "Edit Role" on any user to change their access level
            </li>
            <li>
              <strong>Batch Updates:</strong> Select multiple users using checkboxes, then click "Batch Update" to
              change all selected users to the same role
            </li>
          </ol>
          <div className="mt-3 pt-3 border-t">
            <p className="font-semibold mb-1">Role Definitions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
              <li>
                <strong>Admin:</strong> Full system access, user management, analytics, and configuration
              </li>
              <li>
                <strong>Manager:</strong> API integration management, team usage monitoring, operational settings
              </li>
              <li>
                <strong>User:</strong> Basic access to dashboard features, alerts, uploads, and predictions
              </li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-6 h-6" />
                User Role Management
              </CardTitle>
              <CardDescription>Assign and manage user roles across the platform</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddUserDialog(true)} variant="default" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              {selectedUsers.size > 0 && (
                <Button onClick={() => setShowBatchDialog(true)} variant="outline" size="sm">
                  Batch Update ({selectedUsers.size})
                </Button>
              )}
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="role-filter" className="sr-only">
                Filter by role
              </Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User List */}
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your criteria</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => setSelectedUsers(toggleUserSelection(user.id, selectedUsers))}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.full_name || user.email}</p>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()} • Last updated{" "}
                        {new Date(user.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleEditRole(user)} variant="outline" size="sm">
                    <UserCog className="w-4 h-4 mr-2" />
                    Edit Role
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}. This will immediately affect their access permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">Select New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User - Basic access
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Manager - API management
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current role:</strong> {selectedUser?.role}
                <br />
                <strong>New role:</strong> {newRole}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit} disabled={newRole === selectedUser?.role}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {selectedUser?.email}'s role from <strong>{selectedUser?.role}</strong> to{" "}
              <strong>{newRole}</strong>? This action will take effect immediately and may change their access to
              features and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRole}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Update Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Update Roles</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUsers.size} selected user{selectedUsers.size !== 1 ? "s" : ""}. All selected
              users will be assigned the same role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="batch-role">Select Role for All Selected Users</Label>
              <Select value={batchRole} onValueChange={setBatchRole}>
                <SelectTrigger id="batch-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User - Basic access
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Manager - API management
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will update {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""} to the{" "}
                <strong>{batchRole}</strong> role. This action cannot be undone in bulk.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBatchUpdate} disabled={!batchRole}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Update {selectedUsers.size} User{selectedUsers.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account with a specific role. The user will be able to log in immediately with the
              provided credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email Address *</Label>
              <Input
                id="new-user-email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-name">Full Name (Optional)</Label>
              <Input
                id="new-user-name"
                type="text"
                placeholder="John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="new-user-password"
                  type="text"
                  placeholder="Enter password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={generatePassword} variant="outline" size="sm" type="button">
                  <Key className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click "Generate" to create a secure random password, or enter your own
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-role">User Role *</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger id="new-user-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User - Basic access
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Manager - API management
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Make sure to save the password securely and share it with the user through a
                secure channel. They can change it after their first login.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)} disabled={creatingUser}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={creatingUser || !newUserEmail || !newUserPassword}>
              {creatingUser ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
