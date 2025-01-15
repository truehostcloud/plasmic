import type { MutationHook, SWRHook } from '../commerce/utils/types'
import { Checkout } from '../commerce/types'
import type { Provider as OriginalProvider } from '@plasmicpkgs/commerce'

declare module '@plasmicpkgs/commerce' {
  export interface Provider extends OriginalProvider {
    checkout?: {
      useCheckout?: SWRHook<Checkout.GetCheckoutHook> | any
      useSubmitCheckout?: MutationHook<Checkout.SubmitCheckoutHook> | any
    }
  }
}
