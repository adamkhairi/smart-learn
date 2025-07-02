import { Toaster as Sonner } from "sonner"
import { useAppearance } from "@/hooks/use-appearance"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { appearance } = useAppearance()

  return (
    <Sonner
      theme={appearance === 'dark' ? 'dark' : appearance === 'light' ? 'light' : 'system'}
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      expand={true}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
