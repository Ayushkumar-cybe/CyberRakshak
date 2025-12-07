// API Service Layer for CyberRakshak Frontend

// Use relative path so it works with Nginx (Port 80) or direct (if proxied)
// If you are testing on Port 5173 without Nginx, change this back to the full http://IP:8000/api
const API_BASE_URL = '/api';

interface ScanStartRequest {
  target: string;
  scanners?: Record<string, any>;
  config?: Record<string, any>;
  notify_email?: boolean;
  email_recipients?: string[];
}

interface ScanStartResponse {
  job_id: string;
  status: string;
  target: string;
  scanners_requested: string[];
}

interface ScanStatusResponse {
  job_id: string;
  status: string;
  target: string;
  created_at: string;
  scanners_requested: string[] | null;
  tool_status: Record<string, string> | null;
  results: any | null;
}

interface DashboardStatsResponse {
  total_vulnerabilities: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  asset_criticality_score: number;
  open_ports_detected: number;
  unified_cyber_score: number;
  total_assets: number;
  internet_exposed: number;
  high_risk_assets: number;
  cloud_assets: number;
  asset_distribution: Record<string, number>;
}

export interface RemediationStep {
  cve: string;
  title: string;
  severity: string;
  asset: string;
  action: string;
  source: string;
}

// --- MISSING NOTIFICATION INTERFACE ADDED HERE ---
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "error";
  is_read: boolean;
  timestamp: string;
  job_id?: string;
}
// -------------------------------------------------

interface ThreatIntelSummaryResponse {
  total_cve_tracked: number;
  cisa_kev_tracked: number;
  exploits_available: number;
  most_recent_sync: string;
}

interface VulnerabilityMetadata {
    cve_id: string;
    description: string;
    cvss_score: number;
    severity: string;
    is_cisa_kev: boolean;
    has_exploit: boolean;
    last_updated: string;
}

interface AssetResponse {
  id: string;
  name: string;
  ip: string;
  os: string;
  exposure: string;
  risk: string;
  cloud: string;
  discovered_by: string;
  last_seen: string;
}

interface VulnerabilityResponse {
  id: string;
  cve: string;
  title: string;
  description?: string;
  severity: string;
  cvss: number;
  asset: string;
  tool: string;
  date: string;
}

interface JobHistoryResponse {
  job_id: string;
  target: string;
  status: string;
  created_at: string;
  scanners_used: string[];
}

interface ReportStatsResponse {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

interface ReportResponse {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
}

// Chat Assistant Interfaces
interface ChatMessageRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

interface ChatMessageResponse {
  response: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${url} failed:`, error);
    throw error;
  }
}

// Scan APIs
export const startScan = async (request: ScanStartRequest): Promise<ScanStartResponse> => {
  return apiCall<ScanStartResponse>('/scan/start', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getScanStatus = async (jobId: string): Promise<ScanStatusResponse> => {
  return apiCall<ScanStatusResponse>(`/scan/status/${jobId}?include_results=false`);
};

export const getScanGraph = async (jobId: string): Promise<any> => {
  return apiCall<any>(`/scan/graph/${jobId}`);
};

export const getScanReport = async (jobId: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/scan/report/${jobId}`);
  return response.blob();
};

export const getAuditLogs = async (limit: number = 50): Promise<any[]> => {
  return apiCall<any[]>(`/scan/logs?limit=${limit}`);
};

// Dashboard APIs
export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  return apiCall<DashboardStatsResponse>('/dashboard/stats');
};

// Asset APIs
export const getAssets = async (skip: number = 0, limit: number = 100): Promise<AssetResponse[]> => {
  return apiCall<AssetResponse[]>(`/assets?skip=${skip}&limit=${limit}`);
};

// Vulnerability APIs
export const getVulnerabilities = async (skip: number = 0, limit: number = 100): Promise<VulnerabilityResponse[]> => {
  return apiCall<VulnerabilityResponse[]>(`/vulnerabilities?skip=${skip}&limit=${limit}`);
};

// Job History APIs
export const getJobHistory = async (skip: number = 0, limit: number = 100): Promise<JobHistoryResponse[]> => {
  return apiCall<JobHistoryResponse[]>(`/jobs?skip=${skip}&limit=${limit}`);
};

// Report APIs
export const getReports = async (skip: number = 0, limit: number = 100): Promise<ReportResponse[]> => {
  return apiCall<ReportResponse[]>(`/reports?skip=${skip}&limit=${limit}`);
};

// Chat Assistant APIs
export const sendChatMessage = async (message: string): Promise<string> => {
  const request: ChatMessageRequest = { message };
  const response = await apiCall<ChatMessageResponse>('/chat/message', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.response;
};

// Stream chat response
export async function* streamChatResponse(
  message: string, 
  history: { role: "user" | "assistant"; content: string }[] = []
): AsyncGenerator<string, void, unknown> {
  
  const url = `${API_BASE_URL}/chat/stream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  if (!response.body) throw new Error('Response body is null');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}

export const getThreatIntelSummary = async (): Promise<ThreatIntelSummaryResponse> => {
  return apiCall<ThreatIntelSummaryResponse>("/threat-intel/summary", "GET");
};

export const getThreatIntelFeed = async (skip: number = 0, limit: number = 50): Promise<VulnerabilityMetadata[]> => {
  return apiCall<VulnerabilityMetadata[]>(`/threat-intel/feed?skip=${skip}&limit=${limit}`, "GET");
};

export const getReportStats = async (): Promise<ReportStatsResponse> => {
  return apiCall<ReportStatsResponse>('/reports/stats');
};

export const getRemediationPlan = async (jobId: string): Promise<RemediationStep[]> => {
  return apiCall<RemediationStep[]>(`/remediation/${jobId}`);
};

// --- NEW: NOTIFICATION FUNCTIONS ---
export const getNotifications = async (): Promise<Notification[]> => {
  // The backend endpoint is /api/scan/logs but tailored for notifications? 
  // Or strictly /notifications if you added that endpoint.
  // Assuming we use the /notifications endpoint we defined in the previous backend step:
  return apiCall<Notification[]>('/notifications');
};

export const markNotificationRead = async (id: string): Promise<void> => {
  // Placeholder if backend doesn't have this specific route yet
  return Promise.resolve();
};
// -----------------------------------
