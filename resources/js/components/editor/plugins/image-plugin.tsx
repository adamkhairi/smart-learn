import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, createCommand, LexicalCommand } from "lexical"
import { useEffect } from "react"

// Create a custom command for inserting images
export const INSERT_IMAGE_COMMAND: LexicalCommand<{ src: string; alt?: string }> = createCommand()

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // Register command for inserting images
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: { src: string; alt?: string }) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            // For now, insert as markdown text
            // In a more advanced implementation, you'd create a proper ImageNode
            selection.insertText(`![${payload.alt || 'Image'}](${payload.src})`)
          }
        })
        return true
      },
      1
    )
  }, [editor])

  return null
}
