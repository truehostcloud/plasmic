import { useCommerce as useCoreCommerce } from '@plasmicpkgs/commerce'
import { getSpreeProvider, SpreeProvider } from './provider'
import { getCommerceProvider as getCoreCommerceProvider } from './commerce'

export type { SpreeProvider }

export const useCommerce = () => useCoreCommerce<SpreeProvider>()

export const getCommerceProvider = (apiHost: string) =>
  getCoreCommerceProvider(getSpreeProvider(apiHost))
