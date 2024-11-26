import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { TrashIcon, PencilIcon } from "lucide-react";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";

interface User {
  _id: string;
  username: string;
  role: string;
  password: string;
}

const UserSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "reception",
  });
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch users from the backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await crudRequest<User[]>("GET", "/user/get-admin"); // Replace with your API endpoint
      setUsers(response);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await crudRequest("POST", "/user/register-admin", newUser)
        .then(() => {
          toast.success("User registered successfully");
        })
        .catch(() => {
          toast.error("Failed to register user");
        });
      fetchUsers();
      setOpenModal(false);
    } catch (error) {
      console.error("Failed to create user", error);
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await crudRequest("PUT", `/user/update-admin/${id}`, { role })
        .then(() => {
          toast.success("Role updated successfully");
        })
        .catch(() => {
          toast.error("Failed to update role");
        });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await crudRequest("DELETE", `/user/delete-admin/${deleteUserId}`)
        .then(() => {
          toast.success("User deleted successfully");
        })
        .catch(() => {
          toast.error("Failed to delete user");
        });
      fetchUsers();
      setDeleteUserId(null);
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">User Management</h1>
        <Button onClick={() => setOpenModal(true)}>Create New User</Button>
      </div>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users &&
            users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleUpdateRole(user._id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="reception">Receptionist</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditUser(user)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteUserId(user._id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Modal for creating/editing users */}
      <Dialog
        open={openModal || !!editUser}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpenModal(false);
            setEditUser(null); // Close dialog and reset edit user
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={editUser ? editUser.username : newUser.username}
              onChange={(e) =>
                editUser
                  ? setEditUser({ ...editUser, username: e.target.value })
                  : setNewUser({ ...newUser, username: e.target.value })
              }
            />
            <Input
              placeholder="Password"
              value={editUser ? editUser.password : newUser.password}
              onChange={(e) =>
                editUser
                  ? setEditUser({ ...editUser, password: e.target.value })
                  : setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <Select
              value={editUser ? editUser.role : newUser.role}
              onValueChange={(value) =>
                editUser
                  ? setEditUser({ ...editUser, role: value })
                  : setNewUser({ ...newUser, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="reception">Receptionist</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="mt-4"
            onClick={
              editUser
                ? () => handleUpdateRole(editUser._id, editUser.role)
                : handleCreateUser
            }
          >
            {editUser ? "Update User" : "Create User"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting user */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this user?</p>
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;
