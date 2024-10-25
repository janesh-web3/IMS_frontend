import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { crudRequest } from "@/lib/api";

export default function UserNav({handleLogout} : any) {
 



  const logout = async () => {
    const logoutTime = new Date();
    
    // Capture logout event
    const response =  await crudRequest('POST','/session/end', {
      logoutTime,
    });

    if(response){
      sessionStorage.clear();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-12 h-12 rounded-full">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={
              "/profile.jpg"
              }
              alt={""}
            />
            <AvatarFallback>hello</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{"Admin"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {"admin@gmail.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Notifications
            <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Administration
            <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘L</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
