  import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

interface ToastState {
  show: boolean;
  type: ToastType;
  position: ToastPosition;
  content: React.ReactNode;
  img?: string;
  duration: number;
  triggerToast: (
    content: React.ReactNode,
    type?: ToastType,
    position?: ToastPosition,
    img?: string,
    duration?: number
  ) => void;
  closeToast: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  show: false,
  type: 'info',
  position: 'top-right',
  content: '',
  img: '',
  duration: 2000,
  triggerToast: (
    content,
    type = 'info',
    position = 'top-right',
    img = '',
    duration = 2000
  ) => set({ show: true, content, type, position, img, duration }),
  closeToast: () => set({ show: false }),
}));
