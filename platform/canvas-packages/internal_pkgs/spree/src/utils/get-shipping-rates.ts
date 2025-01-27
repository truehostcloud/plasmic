import type { GraphQLFetcherResult } from '../types'
import { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import { IShippingMethods } from '@spree/storefront-api-v2-sdk/types/interfaces/ShippingMethod'

const getShippingRates = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<IShippingMethods> => {
  const token: IToken | undefined = ensureIToken()

  if (!token) {
    return null
  } else {
    const { data } = await fetch<GraphQLFetcherResult<IShippingMethods>>({
      variables: {
        methodPath: 'checkout.shippingRates',
        arguments: [
          token,
          {
            include: ['shipping_rates', 'stock_location'].join(','),
          },
        ],
      },
    })
    return data
  }
}

export default getShippingRates
