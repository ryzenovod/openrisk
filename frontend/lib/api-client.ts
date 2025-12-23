const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'local-dev-key';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(options.headers || {})
    },
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function scoreApplication(payload: Record<string, number>) {
  return request('/api/v1/score', { method: 'POST', body: JSON.stringify(payload) });
}

export function fetchDashboard() {
  return request('/api/v1/dashboard');
}

export function createJob(payload: Record<string, unknown>) {
  return request('/api/v1/jobs', { method: 'POST', body: JSON.stringify(payload) });
}

export function fetchJobs(): Promise<any[]> {
  return request<any[]>('/api/v1/jobs');
}

export function fetchJob(jobId: number): Promise<any> {
  return request(`/api/v1/jobs/${jobId}`);
}

export function createJobEventSource(jobId: number) {
  const url = new URL(`${API_BASE}/api/v1/jobs/${jobId}/events`);
  url.searchParams.set('api_key', API_KEY);
  return new EventSource(url.toString());
}
