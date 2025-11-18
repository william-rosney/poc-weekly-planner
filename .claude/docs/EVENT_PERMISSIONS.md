# Event Permissions System

## Overview

Role-based permission system for calendar event editing and deletion.

## Rules

- **Members**: Can only edit/delete their own events
- **Admins**: Can edit/delete any event

## Implementation Layers

### 1. Permission Helper (`lib/utils.ts`)

```typescript
canEditEvent(eventUserId: string, currentUser: User): boolean
```

Returns `true` if user is admin OR owns the event.

### 2. UI Layer (UX)

**Calendar Component:**
- Sets `editable`, `startEditable`, `durationEditable` per event
- Non-editable events cannot be dragged or resized

**EventDetails Component:**
- Hides edit/delete buttons for unauthorized users

### 3. FullCalendar Callback

**Calendar Component:**
- `eventAllow` callback blocks unauthorized drag & drop attempts

### 4. Client-Side Validation

**CalendarClient Component:**
- Validates permissions in `handleEventUpdate` (drag & drop)
- Validates permissions in `handleDeleteEvent`
- Shows alert if unauthorized

### 5. Backend Validation

**useEvents Hook:**
- `updateEvent`: Fetches current user, checks permissions before update
- `deleteEvent`: Fetches current user, checks permissions before delete
- Returns error if permission denied

## Security

Multi-layer approach ensures:
- Smooth UX (no visible controls for unauthorized actions)
- Prevention at interaction level (FullCalendar callbacks)
- Client-side validation (explicit checks)
- Backend validation (server-side security)

## Database

RLS policies should mirror these rules for complete security:
```sql
-- Members can only update their own events
CREATE POLICY "Members can update own events" ON events
  FOR UPDATE USING (auth.uid() = user_id OR current_user_role() = 'admin');

-- Members can only delete their own events
CREATE POLICY "Members can delete own events" ON events
  FOR DELETE USING (auth.uid() = user_id OR current_user_role() = 'admin');
```
