import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserAvatar = () => (
  <div className="fixed top-4 left-4">
    <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/108114245?v=4" alt="@user" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  </div>
);

export default UserAvatar;
