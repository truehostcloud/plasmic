import type { GraphQLFetcherResult } from '../types'
import { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import { requireConfigValue } from '../isomorphic-config'
import { IShippingMethods } from '@spree/storefront-api-v2-sdk/types/interfaces/ShippingMethod'

const imagesSize = requireConfigValue('imagesSize') as string
const imagesQuality = requireConfigValue('imagesQuality') as number

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
        methodPath: 'cart.shippingRates',
        arguments: [
          token,
          {
            include: [
              'line_items',
              'line_items.variant',
              'line_items.variant.product',
              'line_items.variant.product.images',
              'line_items.variant.images',
              'line_items.variant.option_values',
              'line_items.variant.product.option_types',
            ].join(','),
            image_transformation: {
              quality: imagesQuality,
              size: imagesSize,
            },
          },
        ],
      },
    })
    return data
  }
}

export default getShippingRates
