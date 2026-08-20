import { MCPServerRegistryEntry, MCPServerRegistrySummary } from '../types';

const LOCAL_STORAGE_KEY = 'camelot_mcp_registry_servers_v1';

export async function fetchMCPServers(): Promise<MCPServerRegistryEntry[]> {
  try {
    const res = await fetch('/api/mcp/v1/registry');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.servers)) {
        // Sync to local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.servers));
        return data.servers;
      }
    }
  } catch (err) {
    console.warn('Backend registry fetch failed, using local storage fallback:', err);
  }

  // Fallback to localStorage or default
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return [];
}

export async function fetchRegistrySummary(): Promise<MCPServerRegistrySummary | null> {
  try {
    const res = await fetch('/api/mcp/v1/registry/summary');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend registry summary fetch failed:', err);
  }
  return null;
}

export async function toggleServerConnection(serverId: string): Promise<MCPServerRegistryEntry | null> {
  try {
    const res = await fetch(`/api/mcp/v1/registry/${encodeURIComponent(serverId)}/toggle`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return data.server;
    }
  } catch (err) {
    console.error('Failed to toggle server connection:', err);
  }
  return null;
}

export async function pingServerEndpoint(serverId: string): Promise<{ latencyMs: number; status: string; timestamp: string } | null> {
  try {
    const res = await fetch(`/api/mcp/v1/registry/${encodeURIComponent(serverId)}/ping`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to ping server:', err);
  }
  return null;
}

export async function registerNewServer(server: Partial<MCPServerRegistryEntry>): Promise<MCPServerRegistryEntry | null> {
  try {
    const res = await fetch('/api/mcp/v1/registry/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(server)
    });
    if (res.ok) {
      const data = await res.json();
      return data.server;
    }
  } catch (err) {
    console.error('Failed to register new server:', err);
  }
  return null;
}

export async function deleteCustomServer(serverId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/mcp/v1/registry/${encodeURIComponent(serverId)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.error('Failed to delete custom server:', err);
  }
  return false;
}
