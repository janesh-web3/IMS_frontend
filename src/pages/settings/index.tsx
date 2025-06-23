import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSettings from "@/components/shared/UserSetting";
import { NotificationSoundSettings } from "@/components/settings/NotificationSoundSettings";

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <UserSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            <NotificationSoundSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
