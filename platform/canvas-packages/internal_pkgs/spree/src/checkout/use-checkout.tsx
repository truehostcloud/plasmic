import { SWRHook } from '@plasmicpkgs/commerce'
import useCheckout, { UseCheckout } from '../commerce/checkout/use-checkout'
import getCart from '../utils/get-cart'
import normalizeCart from '../utils/normalizations/normalize-cart'
import { useMemo } from 'react'
import { GetCheckoutHook } from '../commerce/types/checkout'
import getShippingRates from '../utils/get-shipping-rates'
import getPaymentMethods from '../utils/get-payment-methods'

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
    let shippingRates = null
    let paymentMethods = null
    if (cart.shippingAddress) {
      shippingRates = await getShippingRates(fetch)
      paymentMethods = await getPaymentMethods(fetch)
    }
    return {
      hasPayment: cart.payments.length > 0,
      hasShipping: cart.shipments.length > 0,
      addressId: null,
      payments: cart.payments,
      cardId: null,
      lineItems: cart.lineItems,
      billingAddress: cart.billingAddress,
      shippingAddress: cart.shippingAddress,
      shipments: cart.shipments,
      shippingRates,
      paymentMethods,
    }
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
