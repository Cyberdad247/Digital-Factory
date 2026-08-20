/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// Google Drive Integration (v3)
// ==========================================
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  modifiedTime?: string;
}

export async function listDriveFiles(token: string, queryStr?: string): Promise<DriveFile[]> {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('pageSize', '30');
  url.searchParams.set('fields', 'files(id, name, mimeType, webViewLink, iconLink, size, modifiedTime)');
  url.searchParams.set('orderBy', 'modifiedTime desc');
  if (queryStr) {
    url.searchParams.set('q', queryStr);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Drive API error: ${res.status} - ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function uploadDriveFile(
  token: string, 
  name: string, 
  content: string, 
  mimeType: string = 'application/json'
): Promise<DriveFile> {
  const metadata = {
    name,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Drive upload failed: ${res.status} - ${err.error?.message || res.statusText}`);
  }

  return await res.json();
}

export async function deleteDriveFile(token: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Drive delete failed: ${res.status} - ${err.error?.message || res.statusText}`);
  }
  return true;
}

// ==========================================
// Google Sheets Integration (v4)
// ==========================================
export interface SheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  spreadsheetUrl: string;
}

export async function createGoogleSpreadsheet(
  token: string, 
  title: string, 
  headerRow: string[], 
  initialRows: (string | number)[][] = []
): Promise<SheetMetadata> {
  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Forged Metrics',
          gridProperties: {
            rowCount: Math.max(initialRows.length + 10, 50),
            columnCount: Math.max(headerRow.length + 2, 10),
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: headerRow.map(h => ({ userEnteredValue: { stringValue: h } })),
              },
              ...initialRows.map(row => ({
                values: row.map(val => ({
                  userEnteredValue: typeof val === 'number' ? { numberValue: val } : { stringValue: String(val) },
                })),
              })),
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Sheets create failed: ${res.status} - ${err.error?.message || res.statusText}`);
  }

  return await res.json();
}

export async function appendToGoogleSheet(
  token: string, 
  spreadsheetId: string, 
  range: string, 
  rows: (string | number)[][]
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Sheets append failed: ${res.status} - ${err.error?.message || res.statusText}`);
  }
}

// ==========================================
// Google Docs Integration (v1)
// ==========================================
export interface DocMetadata {
  documentId: string;
  title: string;
  documentUrl?: string;
}

export async function createGoogleDocument(
  token: string, 
  title: string, 
  initialBodyText: string
): Promise<DocMetadata> {
  // 1. Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(`Docs create failed: ${createRes.status} - ${err.error?.message || createRes.statusText}`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Insert initial content
  if (initialBodyText && initialBodyText.trim().length > 0) {
    const batchUpdateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: initialBodyText + '\n\n',
            },
          },
        ],
      }),
    });

    if (!batchUpdateRes.ok) {
      console.warn('Document created but failed to populate text:', await batchUpdateRes.text());
    }
  }

  return {
    documentId,
    title,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

// ==========================================
// Google Calendar Integration (v3)
// ==========================================
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
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
  htmlLink?: string;
  status?: string;
}

export async function listCalendarEvents(token: string, maxResults: number = 20): Promise<CalendarEvent[]> {
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('timeMin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Calendar API error: ${res.status} - ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function createCalendarEvent(token: string, event: CalendarEvent): Promise<CalendarEvent> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Calendar event creation failed: ${res.status} - ${err.error?.message || res.statusText}`);
  }

  return await res.json();
}

export async function deleteCalendarEvent(token: string, eventId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Calendar event delete failed: ${res.status} - ${err.error?.message || res.statusText}`);
  }
  return true;
}
