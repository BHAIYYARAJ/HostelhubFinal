import { useMemo } from "react";
import { useStudentBookings } from "@/hooks/useBookings";
import { useStudentInquiries } from "@/hooks/useStudentInquiries";
import { useChatConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@/store/useAuthStore";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  href: string;
  unread: boolean;
  kind: "booking" | "inquiry" | "chat";
}

export function useStudentNotifications() {
  const user = useAuthStore((s) => s.user);
  const bookings = useStudentBookings();
  const inquiries = useStudentInquiries();
  const chats = useChatConversations("student");

  const data = useMemo<AppNotification[]>(() => {
    if (!user) return [];
    const result: AppNotification[] = [];
    for (const b of bookings.data ?? []) {
      result.push({ id: `booking-${b.id}`, title: `Booking ${b.status}`, body: `${b.hostel?.name ?? "Hostel"} · ${b.room_type}`, time: b.updated_at, href: "/my-bookings", unread: b.status !== "pending", kind: "booking" });
    }
    for (const i of inquiries.data ?? []) {
      result.push({ id: `inquiry-${i.id}`, title: i.status === "replied" ? "Owner replied to your inquiry" : `Inquiry ${i.status}`, body: `${i.hostel?.name ?? "Hostel"} · ${i.subject}`, time: i.updated_at, href: "/my-inquiries", unread: i.status === "replied", kind: "inquiry" });
    }
    for (const c of chats.data ?? []) {
      if ((c.unread_count ?? 0) > 0) {
        result.push({ id: `chat-${c.id}`, title: "New chat message", body: `${c.hostel?.name ?? "Hostel"} · ${c.last_message?.content || "New message"}`, time: c.last_message?.created_at ?? c.updated_at, href: `/chats/${c.id}`, unread: true, kind: "chat" });
      }
    }
    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [user, bookings.data, inquiries.data, chats.data]);

  return { data, isLoading: bookings.isLoading || inquiries.isLoading || chats.isLoading };
}
