import { create } from 'zustand';

interface AppState {
  // Document state
  documentId: string | null;
  documentName: string | null;
  sessionId: string | null;
  pageCount: number;

  // PDF viewer state
  currentPage: number;
  zoom: number;

  // UI state
  isSidebarOpen: boolean;
  isUploading: boolean;
  uploadProgress: number;

  // Actions
  setDocument: (documentId: string, documentName: string, sessionId: string, pageCount: number) => void;
  clearDocument: () => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  toggleSidebar: () => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  documentId: null,
  documentName: null,
  sessionId: null,
  pageCount: 0,
  currentPage: 1,
  zoom: 1.0,
  isSidebarOpen: true,
  isUploading: false,
  uploadProgress: 0,

  // Actions
  setDocument: (documentId, documentName, sessionId, pageCount) =>
    set({
      documentId,
      documentName,
      sessionId,
      pageCount,
      currentPage: 1,
    }),

  clearDocument: () =>
    set({
      documentId: null,
      documentName: null,
      sessionId: null,
      pageCount: 0,
      currentPage: 1,
    }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setZoom: (zoom) => set({ zoom }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setIsUploading: (isUploading) => set({ isUploading }),
}));
