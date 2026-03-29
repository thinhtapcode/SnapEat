import { toast } from 'react-hot-toast';

export const notify = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      icon: '🎉', // Có thể tùy biến Icon cho app SnapEat
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      icon: '❌',
    });
  },

  loading: (message: string) => {
    return toast.loading(message); // Trả về ID để sau này tự tắt
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  }
};