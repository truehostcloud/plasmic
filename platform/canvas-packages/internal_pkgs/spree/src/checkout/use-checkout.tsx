import { SWRHook } from '@plasmicpkgs/commerce'
import useCheckout, { UseCheckout } from '../commerce/checkout/use-checkout'
import type { GetCheckoutHook } from '../commerce/types/checkout'

export default useCheckout as UseCheckout<typeof handler>

export const handler: SWRHook<GetCheckoutHook> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    // TODO: Revise url and query
    url: 'checkout',
    query: 'show',
  },
  async fetcher({ input, options, fetch }) {},
  useHook:
    ({ useData }) =>
    async (input) => ({}),
}
