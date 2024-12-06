import {
  getCommerceProvider as getCoreCommerceProvider,
  useCommerce as useCoreCommerce,
} from '@plasmicpkgs/commerce'
import { getSpreeProvider, SpreeProvider } from './provider'


export const useCommerce = () => useCoreCommerce<SpreeProvider>()

export const getCommerceProvider = (apiHost: string) =>
  getCoreCommerceProvider(getSpreeProvider(apiHost))

