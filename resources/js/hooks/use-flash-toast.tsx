import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { useToast } from './use-toast'

interface FlashMessages {
  success?: string
  error?: string
  warning?: string
  info?: string
}

interface PageProps {
  flash?: FlashMessages
  errors?: Record<string, string>
  [key: string]: unknown
}

export const useFlashToast = () => {
  const { flash, errors } = usePage<PageProps>().props
  const { success, error, warning, info } = useToast()

  useEffect(() => {
    // Debug: Log flash messages
    if (flash) {
      console.log('Flash messages:', flash)
    }

    if (errors && Object.keys(errors).length > 0) {
      console.log('Page errors:', errors)
    }

    // Handle flash messages
    if (flash?.success) {
      success(flash.success)
    }

    if (flash?.error) {
      error(flash.error)
    }

    if (flash?.warning) {
      warning(flash.warning)
    }

    if (flash?.info) {
      info(flash.info)
    }

    // Handle page-level errors
    if (errors?.error) {
      error(errors.error)
    }
  }, [flash, errors, success, error, warning, info])
}
