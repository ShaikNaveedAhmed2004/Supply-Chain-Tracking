import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { batchAPI, SupplyChainEvent } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    // Initial load
    checkForUpdates();

    // Poll every 30 seconds for new updates
    const interval = setInterval(checkForUpdates, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return;

      const userData = JSON.parse(user);
      const batches = await batchAPI.getMyBatches();

      const newNotifications: Notification[] = [];

      // Check each batch for recent events
      for (const batch of batches) {
        try {
          const history = await batchAPI.getHistory(batch.id);
          
          // Filter events that occurred after last check
          const recentEvents = history.filter((event: SupplyChainEvent) => {
            const eventDate = new Date(event.timestamp);
            return eventDate > lastChecked;
          });

          // Create notifications for recent events
          recentEvents.forEach((event: SupplyChainEvent) => {
            if (event.toParty === userData.id) {
              newNotifications.push({
                id: `event-${event.id}`,
                title: "Batch Received",
                description: `You received batch ${batch.batchNumber} from ${event.fromPartyEmail}. Status: ${event.status}`,
                timestamp: new Date(event.timestamp),
                read: false,
              });
            } else if (event.fromParty === userData.id) {
              newNotifications.push({
                id: `event-${event.id}`,
                title: "Batch Transferred",
                description: `Batch ${batch.batchNumber} was transferred to ${event.toPartyEmail}. Status: ${event.status}`,
                timestamp: new Date(event.timestamp),
                read: false,
              });
            }
          });
        } catch (error) {
          // Skip batches that fail to load history
          continue;
        }
      }

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50
        setUnreadCount((prev) => prev + newNotifications.length);
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read
                        ? "bg-background border-border"
                        : "bg-accent/50 border-accent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-foreground">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
