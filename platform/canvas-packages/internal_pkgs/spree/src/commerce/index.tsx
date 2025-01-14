import type { Provider as BaseProvider } from '@plasmicpkgs/commerce'
import type { SWRHook, MutationHook } from './utils/types'
import type { Checkout } from './types'

export type Provider = BaseProvider & {
  checkout?: {
    useCheckout?: SWRHook<Checkout.GetCheckoutHook>
    useSubmitCheckout?: MutationHook<Checkout.SubmitCheckoutHook>
  }
}
