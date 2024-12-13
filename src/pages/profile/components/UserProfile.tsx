import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { crudRequest } from "@/lib/api";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface UserProfileProps {
  name: string;
  role: string;
  id: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, role, id }) => {
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    role: string;
  }>({
    username: "",
    password: "",
    role: role,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof newUser
  ) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUpdateRole = async () => {
    try {
      await crudRequest("PUT", `/user/update-admin/${id}`, newUser)
        .then(() => {
          toast.success("Saved successfully");
          setShowModal(false); // Close the modal on success
        })
        .catch(() => {
          toast.error("Failed to save!");
        });
    } catch (error) {
      console.error("Failed to save !", error);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 border rounded-lg shadow-lg bg-card">
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-xl font-semibold">Username: {name}</h2>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {role && (
          <div>
            <h3 className="text-sm font-medium">Role: {role}</h3>
          </div>
        )}
      </div>
      <button
        className="w-full px-4 py-2 mt-4 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
        onClick={() => setShowModal(true)}
      >
        Edit Profile
      </button>
      {showModal && (
        <Dialog
          open={showModal}
          onOpenChange={(isOpen) => setShowModal(isOpen)}
        >
          <DialogContent className="p-10 ">
            <DialogHeader>
              <DialogTitle>Update Profile</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Name"
              value={newUser.username}
              onChange={(e) => handleInputChange(e, "username")}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => handleInputChange(e, "password")}
            />
            <Button
              className="px-4 py-2 rounded-lg bg-primary"
              onClick={handleUpdateRole}
            >
              Save Changes
            </Button>
            <Button
              variant={"default"}
              className="bg-destructive hover:bg-muted"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserProfile;
