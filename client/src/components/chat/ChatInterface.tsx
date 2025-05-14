import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageWithSender } from "@shared/schema";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  bookingId: number;
  className?: string;
}

const ChatInterface = ({ bookingId, className = "" }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Query to fetch messages
  const {
    data: messages,
    isLoading,
    error,
    refetch
  } = useQuery<MessageWithSender[]>({
    queryKey: [`/api/bookings/${bookingId}/messages`],
    enabled: !!bookingId && !!user,
    refetchInterval: 10000, // Poll for new messages every 10 seconds
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      // Clear the input field and refetch messages
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${bookingId}/messages`] });
      
      // Also invalidate unread count
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
      
      // Focus the textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message."
      });
    }
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  // Handle enter key to send message (ctrl/cmd + enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format the timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return format(date, "MMM d, h:mm a");
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">Failed to load messages</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-base font-medium">Booking Communication</CardTitle>
      </CardHeader>
      
      <ScrollArea className="h-[350px] p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isCurrentUser = msg.sender.id === (user?.id || 0);
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex gap-2 max-w-[80%]">
                    {!isCurrentUser && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className={`text-xs ${msg.sender.isVanOwner ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                                {getInitials(msg.sender.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{msg.sender.fullName}</p>
                            <p className="text-xs opacity-70">
                              {msg.sender.isVanOwner ? "Van Owner" : "Customer"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    <div>
                      <div 
                        className={`rounded-lg p-3 text-sm ${
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div 
                        className={`text-xs mt-1 text-muted-foreground ${
                          isCurrentUser ? "text-right" : ""
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                    
                    {isCurrentUser && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                {getInitials(user?.fullName || "")}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user?.fullName}</p>
                            <p className="text-xs opacity-70">You</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below.</p>
            </div>
          </div>
        )}
      </ScrollArea>
      
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="resize-none min-h-[80px]"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="h-10 w-10 p-2"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="w-full mt-2">
          <p className="text-xs text-muted-foreground text-right">
            Press <kbd className="px-1 py-0.5 rounded border">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded border">Enter</kbd> to send
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;