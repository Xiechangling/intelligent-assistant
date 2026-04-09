import { useMemo } from 'react';
import { isToday, isYesterday, isWithinInterval, subDays } from 'date-fns';

export interface SessionRecord {
  id: string;
  title: string;
  updatedAt: string;
  lastActivityAt?: string;
  [key: string]: any;
}

export interface SessionGroups {
  today: SessionRecord[];
  yesterday: SessionRecord[];
  last7Days: SessionRecord[];
  last30Days: SessionRecord[];
  older: SessionRecord[];
}

export function useSessionGrouping(sessions: SessionRecord[]): SessionGroups {
  return useMemo(() => {
    const now = new Date();
    const groups: SessionGroups = {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      older: []
    };

    sessions.forEach(session => {
      const dateStr = session.lastActivityAt || session.updatedAt;
      const date = new Date(dateStr);

      if (isToday(date)) {
        groups.today.push(session);
      } else if (isYesterday(date)) {
        groups.yesterday.push(session);
      } else if (isWithinInterval(date, { start: subDays(now, 7), end: now })) {
        groups.last7Days.push(session);
      } else if (isWithinInterval(date, { start: subDays(now, 30), end: now })) {
        groups.last30Days.push(session);
      } else {
        groups.older.push(session);
      }
    });

    // Sort each group by date descending (most recent first)
    Object.values(groups).forEach(group => {
      group.sort((a: SessionRecord, b: SessionRecord) => {
        const dateA = new Date(a.lastActivityAt || a.updatedAt).getTime();
        const dateB = new Date(b.lastActivityAt || b.updatedAt).getTime();
        return dateB - dateA;
      });
    });

    return groups;
  }, [sessions]);
}
