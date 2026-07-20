export type DraftType = "MOU" | "Event" | "Program" | "Visit";

export interface DraftItem {
  id: string;
  type: DraftType;
  title: string;
  role: string;
  savedAt: string;
  data: any; // the JSON payload
}

export const getDrafts = (role: string): DraftItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const drafts = JSON.parse(localStorage.getItem(`drafts_${role}`) || "[]");
    return drafts;
  } catch (err) {
    return [];
  }
};

export const saveDraft = (role: string, type: DraftType, title: string, data: any, draftId?: string) => {
  if (typeof window === "undefined") return;
  const drafts = getDrafts(role);
  const id = draftId || `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const newDraft: DraftItem = {
    id,
    type,
    title: title || `Untitled ${type}`,
    role,
    savedAt: new Date().toISOString(),
    data
  };

  const existingIndex = drafts.findIndex(d => d.id === id);
  if (existingIndex >= 0) {
    drafts[existingIndex] = newDraft;
  } else {
    drafts.push(newDraft);
  }

  localStorage.setItem(`drafts_${role}`, JSON.stringify(drafts));
  return id;
};

export const deleteDraft = (role: string, id: string) => {
  if (typeof window === "undefined") return;
  const drafts = getDrafts(role);
  const filtered = drafts.filter(d => d.id !== id);
  localStorage.setItem(`drafts_${role}`, JSON.stringify(filtered));
};

export const getDraftById = (role: string, id: string): DraftItem | undefined => {
  const drafts = getDrafts(role);
  return drafts.find(d => d.id === id);
};
