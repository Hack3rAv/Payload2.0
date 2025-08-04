import { apiRequest } from './queryClient';
import { Payload } from '@shared/schema';

// Payload API functions
const API_BASE_URL = 'https://payload-api.avrodipff.workers.dev/'; // Replace with your Workers API URL

export const fetchPayloads = async (token: string): Promise<Payload[]> => {
  const response = await fetch(`${API_BASE_URL}/api/payloads`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payloads');
  }

  return response.json();
};

export interface UploadPayloadData {
  file: File;
  framework: string;
  description: string;
  listeningDetails: string;
}

export const uploadPayload = async (data: UploadPayloadData, token: string): Promise<Payload> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('framework', data.framework);
  formData.append('description', data.description);
  formData.append('listeningDetails', data.listeningDetails);

  const response = await fetch(`${API_BASE_URL}/api/payloads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload payload');
  }

  return response.json();
};

export const deletePayload = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/payloads/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete payload');
  }
};

export const getDownloadUrl = (id: number): string => {
  return `${API_BASE_URL}/api/payloads/download/${id}`;
};

// Auth API functions
export const login = async (password: string): Promise<{ token: string; user: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

export const getCurrentUser = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return { user: null };
  }

  return response.json();
};
