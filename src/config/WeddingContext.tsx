import { createContext, useContext } from 'react'
import { defaultWedding, type WeddingConfig } from './wedding'

/** Components read the wedding details from here, never from literals. */
export const WeddingContext = createContext<WeddingConfig>(defaultWedding)
export const useWedding = () => useContext(WeddingContext)
