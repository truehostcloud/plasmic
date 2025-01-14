import {
  CommerceProviderProps,
  CoreCommerceProvider,
  Provider as BaseProvider,
} from '@plasmicpkgs/commerce'
import type { SWRHook, MutationHook } from './utils/types'
import type { Checkout } from './types'
import React from 'react'

export type Provider = BaseProvider & {
  checkout?: {
    useCheckout?: SWRHook<Checkout.GetCheckoutHook>
    useSubmitCheckout?: MutationHook<Checkout.SubmitCheckoutHook>
  }
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
