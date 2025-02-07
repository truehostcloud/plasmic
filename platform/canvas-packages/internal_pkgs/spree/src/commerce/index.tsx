/*
  Forked from https://github.com/vercel/commerce/tree/main/packages/commerce/src
  Changes: Removed authentication, customer and wishlist hooks
*/
import React, {
  ReactNode,
  MutableRefObject,
  createContext,
  useContext,
  useMemo,
  useRef,
} from 'react'
import type { Fetcher } from './utils/types'
import { Provider } from '@plasmicpkgs/commerce'

const Commerce = createContext<CommerceContextValue<any> | {}>({})

export type CommerceConfig = {
  locale: string
  cartCookie: string
}

export type CommerceContextValue<P extends Provider> = {
  providerRef: MutableRefObject<P>
  fetcherRef: MutableRefObject<Fetcher>
} & CommerceConfig

export type CommerceProps<P extends Provider> = {
  children?: ReactNode
  provider: P
}

/**
 * These are the properties every provider should allow when implementing
 * the core commerce provider
 */
export type CommerceProviderProps = {
  children?: ReactNode
} & Partial<CommerceConfig>

export function CoreCommerceProvider<P extends Provider>({
  provider,
  children,
}: CommerceProps<P>) {
  const providerRef = useRef(provider)
  // TODO: Remove the fetcherRef
  const fetcherRef = useRef(provider.fetcher)
  // If the parent re-renders this provider will re-render every
  // consumer unless we memoize the config
  const { locale, cartCookie } = providerRef.current
  const cfg = useMemo(
    () => ({ providerRef, fetcherRef, locale, cartCookie }),
    [locale, cartCookie]
  )

  return <Commerce.Provider value={cfg}>{children}</Commerce.Provider>
}

export function getCommerceProvider<P extends Provider>(provider: P) {
  return function CommerceProvider({
    children,
    ...props
  }: CommerceProviderProps) {
    return (
      <CoreCommerceProvider provider={{ ...provider, ...props }}>
        {children}
      </CoreCommerceProvider>
    )
  }
}

export function useCommerce<P extends Provider>() {
  return useContext(Commerce) as CommerceContextValue<P>
}
