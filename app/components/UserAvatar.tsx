import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserAvatar = () => (
  <div className="fixed top-4 left-4 md:top-4 md:left-4 select-none">
    <Avatar>
      <a href="https://github.com/when-dev/nextjs-interactive-map" target="_blank">
        <AvatarImage src="https://avatars.githubusercontent.com/u/108114245?v=4" alt="@user" />
      </a>
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  </div>
);

export default UserAvatar;
