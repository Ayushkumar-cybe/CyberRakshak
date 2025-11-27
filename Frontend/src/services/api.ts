// API Service Layer for CyberRakshak Frontend
const API_BASE_URL = 'http://161.118.189.151:8000/api';

interface ScanStartRequest {
  target: string;
  scanners?: Record<string, any>;
  config?: Record<string, any>;
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
  asset_criticality_score: number;
  open_ports_detected: number;
  unified_cyber_score: number;
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
  return apiCall<ScanStatusResponse>(`/scan/status/${jobId}`);
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

// Stream chat response (returns an async generator)
export async function* streamChatResponse(message: string): AsyncGenerator<string, void, unknown> {
  const url = `${API_BASE_URL}/chat/stream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

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
