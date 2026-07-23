export type DraftType = "MOU" | "Event" | "Program" | "Visit";

export interface DraftItem {
  id: string;
  type: DraftType;
  title: string;
  role: string;
  savedAt: string;
  data: any; // the JSON payload
}

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
}

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getDrafts = async (role: string): Promise<DraftItem[]> => {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`${getApiUrl()}/drafts`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch drafts');
    const json = await res.json();
    return json.data.map((d: any) => ({
      id: d.id,
      type: d.type as DraftType,
      title: d.title,
      role: role,
      savedAt: d.updated_at,
      data: d.data
    }));
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
};

export const saveDraft = async (role: string, type: DraftType, title: string, data: any, draftId?: string) => {
  if (typeof window === "undefined") return;
  try {
    const payload: any = { type, title, data };
    if (draftId) payload.id = draftId;
    
    const res = await fetch(`${getApiUrl()}/drafts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save draft');
    const json = await res.json();
    return json.data.id;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const deleteDraft = async (role: string, id: string) => {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch(`${getApiUrl()}/drafts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete draft');
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

export const getDraftById = async (role: string, id: string): Promise<DraftItem | undefined> => {
  const drafts = await getDrafts(role);
  return drafts.find(d => d.id === id);
};
