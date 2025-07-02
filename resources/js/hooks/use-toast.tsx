import { toast } from "sonner"

export const useToast = () => {
  return {
    success: (message: string, description?: string) => {
      return toast.success(message, {
        description,
      })
    },

    error: (message: string, description?: string) => {
      return toast.error(message, {
        description,
      })
    },

    warning: (message: string, description?: string) => {
      return toast.warning(message, {
        description,
      })
    },

    info: (message: string, description?: string) => {
      return toast.info(message, {
        description,
      })
    },

    loading: (message: string, description?: string) => {
      return toast.loading(message, {
        description,
      })
    },

    dismiss: (id?: string | number) => {
      return toast.dismiss(id)
    },
  }
}
