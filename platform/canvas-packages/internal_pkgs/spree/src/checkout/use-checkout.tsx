import { SWRHook } from '@plasmicpkgs/commerce'
import useCheckout, { UseCheckout } from '../commerce/checkout/use-checkout'
import type { GraphQLFetcherResult } from '../types'
import type { IOrder } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'

export default useCheckout as UseCheckout<typeof handler>

export const handler: SWRHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    // TODO: Revise url and query
    url: 'checkout',
    query: 'show',
  },
  async fetcher({ input, options, fetch }) {
    console.info(
      'useCart fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )
    return fetch<GraphQLFetcherResult<IOrder>>({
      variables: {
        methodPath: 'cart.create',
        arguments: [token],
      },
    })
  },
  useHook:
    ({ useData }) =>
    async (input) => ({}),
}
