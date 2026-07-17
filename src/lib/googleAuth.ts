import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Calendar and Keep scopes
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/keep');
provider.addScope('https://www.googleapis.com/auth/keep.readonly');

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in but no token cached (e.g., page reload), we need them to sign in again to get the token
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- Google Calendar API Helpers ---

export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
}

/**
 * Lists the upcoming events in the primary calendar
 */
export async function listCalendarEvents(maxResults = 10): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please sign in.');

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch calendar events');
  }

  return response.json();
}

/**
 * Creates a single event in the primary calendar
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please sign in.');

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to create calendar event');
  }

  return response.json();
}

/**
 * Parses days offset from durations like "7 días" or "14 días"
 */
function parseDays(duration: string): number {
  const match = duration.match(/(\d+)\s*días?/i);
  if (match) return parseInt(match[1], 10);
  return 0;
}

/**
 * Calculates calendar start/end dates for each stage of a brew batch timeline
 */
export function calculateTimelineDates(startDateStr: string, timeline: { stage: string; duration: string }[]) {
  const dates: { stage: string; start: string; end: string }[] = [];
  let currentStart = new Date(startDateStr);

  // If start date string is invalid, default to today
  if (isNaN(currentStart.getTime())) {
    currentStart = new Date();
  }

  for (const item of timeline) {
    const start = new Date(currentStart);
    let days = parseDays(item.duration);
    
    // For non-day stages (Maceración, Filtrado, Ebullición, Whirlpool, Envasado), use 1 hour block on Google Calendar
    if (days === 0) {
      const end = new Date(start);
      end.setHours(end.getHours() + 2); // default 2 hours block
      dates.push({
        stage: item.stage,
        start: start.toISOString().split('T')[0], // Use all-day event for simplicity
        end: end.toISOString().split('T')[0],
      });
    } else {
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      dates.push({
        stage: item.stage,
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      });
      // Move the start date of the next stage to the end of this stage
      currentStart = end;
    }
  }

  return dates;
}

// --- Google Keep API Helpers ---

export interface KeepNote {
  name?: string; // Resource name of the note (e.g. notes/12345)
  title?: string;
  body?: {
    text?: {
      text?: string;
    };
  };
}

/**
 * Lists notes from Google Keep
 */
export async function listKeepNotes(): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please sign in.');

  const response = await fetch(
    'https://keep.googleapis.com/v1/notes?pageSize=30',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `Error ${response.status}`;
    const errObj = new Error(errorMsg) as any;
    errObj.status = response.status;
    throw errObj;
  }

  return response.json();
}

/**
 * Creates a note in Google Keep
 */
export async function createKeepNote(note: { title: string; text: string }): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please sign in.');

  const response = await fetch(
    'https://keep.googleapis.com/v1/notes',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: note.title,
        body: {
          text: {
            text: note.text
          }
        }
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `Error ${response.status}`;
    const errObj = new Error(errorMsg) as any;
    errObj.status = response.status;
    throw errObj;
  }

  return response.json();
}

/**
 * Deletes a note in Google Keep (by name resource e.g. "notes/123")
 */
export async function deleteKeepNote(name: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('No Google Access Token available. Please sign in.');

  const response = await fetch(
    `https://keep.googleapis.com/v1/${name}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `Error ${response.status}`;
    const errObj = new Error(errorMsg) as any;
    errObj.status = response.status;
    throw errObj;
  }

  return response.json();
}
