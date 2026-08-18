# Hostel Wanderlust implementation notes

This build includes the dedicated Student ↔ Owner chat system, full hostel photo browsing, student inquiries, a dedicated notifications section, saved hostels, and mobile scrolling improvements.

## Student navigation
- Chats: `/chats`
- Inquiries: `/my-inquiries`
- Notifications: `/notifications`
- Saved hostels: `/favorites`

## Inquiry separation
Student inquiries use the existing `inquiries` table and remain separate from `chat_conversations`/`messages`.

## Notifications
The notification page is a UI aggregation of current booking, inquiry, and unread chat activity. It intentionally does not mix notifications into the Inquiry or Chat data models.

## Supabase
Create a local `.env` from `.env.example` and provide the Supabase project URL and publishable key. Apply the migrations in `supabase/migrations` to the target Supabase project before production use.
