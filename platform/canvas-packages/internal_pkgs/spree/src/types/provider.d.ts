import type { MutationHook, SWRHook } from '../commerce/utils/types'
import { Checkout } from '../commerce/types'
import type { Provider as BaseProvider } from '@plasmicpkgs/commerce'

declare module '@plasmicpkgs/commerce' {
  type Provider = BaseProvider & {
    checkout?: {
      useCheckout?: SWRHook<Checkout.GetCheckoutHook> | any
      useSubmitCheckout?: MutationHook<Checkout.SubmitCheckoutHook> | any
    }
  }
}
