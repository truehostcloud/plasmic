import { SWRHook } from '@plasmicpkgs/commerce'
import useCheckout, { UseCheckout } from '../commerce/checkout/use-checkout'
import getCart from '../utils/get-cart'
import normalizeCart from '../utils/normalizations/normalize-cart'
import { useMemo } from 'react'
import { GetCheckoutHook } from '../commerce/types/checkout'
import getShippingRates from '../utils/get-shipping-rates'
import getPaymentMethods from '../utils/get-payment-methods'
import normalizeCheckout from '../utils/normalizations/normalize-checkout'

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
      'useCheckout fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )
    const spreeCartResponse = await getCart(fetch)
    const cart = normalizeCart(spreeCartResponse, spreeCartResponse.data)
    return normalizeCheckout(cart, fetch)
  },
  useHook: ({ useData }) => {
    const useWrappedHook: ReturnType<SWRHook<GetCheckoutHook>['useHook']> = (
      input
    ) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })

      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return response.data?.lineItems?.length ?? 0
              },
              enumerable: true,
            },
          }),
        [response]
      )
    }

    return useWrappedHook
  },
}
