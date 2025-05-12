
import { getAuthHeaders, API_URL } from '@/integrations/supabase/client';

// Generic API request function
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<T> => {
  const headers = await getAuthHeaders();
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  
  return response.json();
};

// API functions for home profiles
export const homeProfilesApi = {
  getAll: () => apiRequest<any[]>('/home_profiles/'),
  getById: (id: string) => apiRequest<any>(`/home_profiles/${id}`),
  create: (data: any) => apiRequest<any>('/home_profiles/', 'POST', data),
  update: (id: string, data: any) => apiRequest<any>(`/home_profiles/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<void>(`/home_profiles/${id}`, 'DELETE'),
};

// API functions for appliances
export const appliancesApi = {
  getAll: () => apiRequest<any[]>('/appliances/'),
  getById: (id: string) => apiRequest<any>(`/appliances/${id}`),
  create: (data: any) => apiRequest<any>('/appliances/', 'POST', data),
  update: (id: string, data: any) => apiRequest<any>(`/appliances/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<void>(`/appliances/${id}`, 'DELETE'),
};

// API functions for service records
export const serviceRecordsApi = {
  getAll: () => apiRequest<any[]>('/service_records/'),
  getById: (id: string) => apiRequest<any>(`/service_records/${id}`),
  create: (data: any) => apiRequest<any>('/service_records/', 'POST', data),
  update: (id: string, data: any) => apiRequest<any>(`/service_records/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<void>(`/service_records/${id}`, 'DELETE'),
};

// API functions for maintenance reminders
export const remindersApi = {
  getAll: () => apiRequest<any[]>('/reminders/'),
  getById: (id: string) => apiRequest<any>(`/reminders/${id}`),
  create: (data: any) => apiRequest<any>('/reminders/', 'POST', data),
  update: (id: string, data: any) => apiRequest<any>(`/reminders/${id}`, 'PUT', data),
  delete: (id: string) => apiRequest<void>(`/reminders/${id}`, 'DELETE'),
  markComplete: (id: string) => apiRequest<any>(`/reminders/${id}/complete`, 'PATCH'),
};
