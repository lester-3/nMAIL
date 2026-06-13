const API = import.meta.env.VITE_API_URL || '/api';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('nmail_token');
  if (token) return { 'Authorization': 'Bearer ' + token };
  return {};
}

function handleAuthError(res: Response): Response {
  if (res.status === 401) {
    localStorage.removeItem('nmail_token');
    localStorage.removeItem('nmail_user');
    window.location.reload();
  }
  return res;
}

export async function loginApi(email: string, password: string): Promise<any> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function fetchEmails(folder = 'all'): Promise<any[]> {
  const res = await fetch(`${API}/emails?folder=${folder}`, { headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch emails');
  return res.json();
}

export async function createEmail(data: any): Promise<{ id: string }> {
  const res = await fetch(`${API}/emails`, {
    method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to create email');
  return res.json();
}

export async function updateEmail(id: string, updates: any): Promise<any> {
  const res = await fetch(`${API}/emails/${id}`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to update email');
  return res.json();
}

export async function deleteEmailApi(id: string): Promise<void> {
  const res = await fetch(`${API}/emails/${id}`, { method: 'DELETE', headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to delete email');
}

export async function fetchContacts(): Promise<any[]> {
  const res = await fetch(`${API}/contacts`, { headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

export async function createContact(data: any): Promise<any> {
  const res = await fetch(`${API}/contacts`, {
    method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to create contact');
  return res.json();
}

export async function updateContactApi(id: string, data: any): Promise<any> {
  const res = await fetch(`${API}/contacts/${id}`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to update contact');
  return res.json();
}

export async function deleteContactApi(id: string): Promise<void> {
  const res = await fetch(`${API}/contacts/${id}`, { method: 'DELETE', headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to delete contact');
}

export async function fetchPhotos(): Promise<any[]> {
  const res = await fetch(`${API}/photos`, { headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch photos');
  return res.json();
}

export async function createPhoto(formData: FormData): Promise<any> {
  const headers = authHeaders();
  const res = await fetch(`${API}/photos`, {
    method: 'POST', headers, body: formData,
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to create photo');
  return res.json();
}

export async function updatePhotoApi(id: string, data: any): Promise<any> {
  const res = await fetch(`${API}/photos/${id}`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to update photo');
  return res.json();
}

export async function deletePhotoApi(id: string): Promise<void> {
  const res = await fetch(`${API}/photos/${id}`, { method: 'DELETE', headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to delete photo');
}

export async function fetchDriveFiles(): Promise<any[]> {
  const res = await fetch(`${API}/drive`, { headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch drive files');
  return res.json();
}

export async function createDriveFile(data: any): Promise<any> {
  const res = await fetch(`${API}/drive`, {
    method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to create drive file');
  return res.json();
}

export async function uploadDriveFile(formData: FormData): Promise<any> {
  const headers = authHeaders();
  const res = await fetch(`${API}/drive`, {
    method: 'POST', headers, body: formData,
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to upload drive file');
  return res.json();
}

export async function updateDriveFileApi(id: string, data: any): Promise<any> {
  const res = await fetch(`${API}/drive/${id}`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to update drive file');
  return res.json();
}

export async function deleteDriveFileApi(id: string): Promise<void> {
  const res = await fetch(`${API}/drive/${id}`, { method: 'DELETE', headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to delete drive file');
}

export async function fetchProfile(): Promise<any> {
  const res = await fetch(`${API}/profile`, { headers: authHeaders() });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfileApi(data: any): Promise<any> {
  const res = await fetch(`${API}/profile`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function uploadProfileAvatar(formData: FormData): Promise<any> {
  const headers = authHeaders();
  const res = await fetch(`${API}/profile/avatar`, {
    method: 'POST', headers, body: formData,
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to upload avatar');
  return res.json();
}

export async function uploadContactAvatar(id: string, formData: FormData): Promise<any> {
  const headers = authHeaders();
  const res = await fetch(`${API}/contacts/${id}/avatar`, {
    method: 'POST', headers, body: formData,
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to upload avatar');
  return res.json();
}
