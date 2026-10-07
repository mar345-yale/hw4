import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/** A product match the agent returned, shaped by the /api/chat contract. */
export interface ChatProduct {
  product_id: string
  name: string
  category: string
  description: string
  price: number
  image_url: string
  product_url: string
  in_stock: boolean
}

interface ChatResultsValue {
  products: ChatProduct[]
  query: string
  show: (products: ChatProduct[], query: string) => void
  clear: () => void
}

const ChatResultsContext = createContext<ChatResultsValue | null>(null)

/** Holds the latest product matches from the chat so the page can render them. */
export function ChatResultsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ChatProduct[]>([])
  const [query, setQuery] = useState('')

  const value = useMemo<ChatResultsValue>(
    () => ({
      products,
      query,
      show: (next, q) => {
        setProducts(next)
        setQuery(q)
      },
      clear: () => {
        setProducts([])
        setQuery('')
      },
    }),
    [products, query],
  )

  return <ChatResultsContext value={value}>{children}</ChatResultsContext>
}

export function useChatResults() {
  const ctx = useContext(ChatResultsContext)
  if (!ctx) throw new Error('useChatResults must be used within ChatResultsProvider')
  return ctx
}
