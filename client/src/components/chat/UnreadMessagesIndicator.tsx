import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

interface UnreadMessagesIndicatorProps {
  className?: string;
}

const UnreadMessagesIndicator = ({ className = '' }: UnreadMessagesIndicatorProps) => {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  
  // Query for unread messages count
  const { data } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });
  
  useEffect(() => {
    if (data && data.count > 0) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
  }, [data]);
  
  if (!user || !hasUnread) return null;
  
  return (
    <Badge 
      variant="destructive" 
      className={`h-5 w-5 p-0 flex items-center justify-center rounded-full ${className}`}
    >
      !
    </Badge>
  );
};

export default UnreadMessagesIndicator;