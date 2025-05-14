import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AvatarWithInitialsProps {
  initials: string;
  className?: string;
}

const AvatarWithInitials = ({ initials, className = "" }: AvatarWithInitialsProps) => {
  return (
    <Avatar className={`bg-blue-100 ${className}`}>
      <AvatarFallback className="bg-blue-100 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarWithInitials;
