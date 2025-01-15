import type {
  CommerceConfig,
  CommerceProps,
  CommerceProviderProps,
  Provider as BaseProvider,
  Fetcher,
} from '@plasmicpkgs/commerce'
import type { SWRHook, MutationHook } from './utils/types'
import type { Checkout } from './types'
import React, { createContext, MutableRefObject, useMemo, useRef } from 'react'

export type CommerceContextValue<P extends Provider> = {
  providerRef: MutableRefObject<P>
  fetcherRef: MutableRefObject<Fetcher>
} & CommerceConfig

const Commerce = createContext<CommerceContextValue<any> | {}>({})

export type Provider = BaseProvider & {
  checkout?: {
    useCheckout?: SWRHook<Checkout.GetCheckoutHook> | any
    useSubmitCheckout?: MutationHook<Checkout.SubmitCheckoutHook>
  }
}

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
