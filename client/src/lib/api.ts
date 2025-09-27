import { Payload } from '@shared/schema';

export interface UploadPayloadData {
  file: File;
  framework: string;
  description: string;
  listeningDetails: string;
}

const API_BASE_URL = 'https://pay-test.avrodipff.workers.dev';

const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});

// Fetch all payloads
export const fetchPayloads = async (token: string): Promise<Payload[]> => {
  const res = await fetch(`${API_BASE_URL}/api/payloads`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) throw new Error('Failed to fetch payloads');
  return res.json();
};

// Upload a payload
export const uploadPayload = async (data: UploadPayloadData, token: string): Promise<Payload> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('framework', data.framework);
  formData.append('description', data.description);
  formData.append('listeningDetails', data.listeningDetails);

  const res = await fetch(`${API_BASE_URL}/api/payloads`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to upload payload');
  return res.json();
};

// Delete a payload
export const deletePayload = async (id: number, token: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/payloads/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) throw new Error('Failed to delete payload');
};

// Get download URL
export const getDownloadUrl = (id: number) => `${API_BASE_URL}/api/payloads/download/${id}`;

// Login
export const login = async (password: string): Promise<{ token: string; user: any }> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login failed');
  }

  return res.json();
};

// Get current user
export const getCurrentUser = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) return { user: null };
  return res.json();
};
