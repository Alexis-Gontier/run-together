import { useState, useCallback } from "react"

export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false)

  const toggle = useCallback(() => setVisible((v) => !v), [])

  return {
    visible,
    toggle,
    inputType: visible ? "text" : "password",
  } as const
}
