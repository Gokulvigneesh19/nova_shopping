import { create } from 'zustand';

interface ModalState {
  modal: string | null;
  /** Optional payload for the open modal (e.g. the order being reviewed). */
  modalData: unknown;
  triggerModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>(set => ({
  modal: null,
  modalData: null,
  triggerModal: (modal: string, data: unknown = null) => set({ modal, modalData: data }),
  // Data is kept so the closing animation still has content; the next triggerModal replaces it.
  closeModal: () => set({ modal: null }),
}));
