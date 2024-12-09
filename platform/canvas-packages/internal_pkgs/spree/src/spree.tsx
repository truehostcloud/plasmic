import {
  getCommerceProvider as getCoreCommerceProvider,
  useCommerce as useCoreCommerce,
} from '@vercel/commerce'
import { getSpreeProvider, SpreeProvider } from './provider'

export type { SpreeProvider }

export const useCommerce = () => useCoreCommerce<SpreeProvider>()

export const getCommerceProvider = (apiHost: string) =>
  getCoreCommerceProvider(getSpreeProvider(apiHost))

