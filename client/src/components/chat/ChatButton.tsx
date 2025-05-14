import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface ChatButtonProps {
  bookingId: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}

const ChatButton = ({ 
  bookingId, 
  variant = 'outline',
  size = 'default',
  label = 'Messages'
}: ChatButtonProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Get unread messages count
  const { data: unreadData } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Count only applies to this booking's messages
  const [hasUnread, setHasUnread] = useState(false);
  
  // Check for unread messages in this specific booking
  useEffect(() => {
    if (open) {
      // Reset unread indicator when chat is opened
      setHasUnread(false);
    }
  }, [open]);
  
  // Update unread indicator if we get new messages
  useEffect(() => {
    const checkUnread = async () => {
      try {
        // Get messages for this booking
        const response = await fetch(`/api/bookings/${bookingId}/messages`);
        if (response.ok) {
          const messages = await response.json();
          // Check if there are any unread messages (simplified check)
          const unreadExists = messages.some((msg: any) => 
            !msg.isRead && msg.senderId !== (user?.id || 0)
          );
          setHasUnread(unreadExists);
        }
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };
    
    if (user && !open) {
      checkUnread();
    }
  }, [bookingId, user, open, unreadData]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className="relative"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {label}
        {hasUnread && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
          >
            !
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chat</DialogTitle>
          </DialogHeader>
          <ChatInterface bookingId={bookingId} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatButton;