import type { GraphQLFetcherResult } from '../types'
import { FetcherError, HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IOrder } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import createEmptyCart from './create-empty-cart'
import isLoggedIn from './tokens/is-logged-in'
import { setCartToken } from './tokens/cart-token'
import { requireConfigValue } from '../isomorphic-config'

const imagesSize = requireConfigValue('imagesSize') as string
const imagesQuality = requireConfigValue('imagesQuality') as number

const getCart = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<IOrder> => {
  let spreeCartResponse: IOrder | null

  const token: IToken | undefined = ensureIToken()

  if (!token) {
    spreeCartResponse = null
  } else {
    try {
      const { data: spreeCartShowSuccessResponse } = await fetch<
        GraphQLFetcherResult<IOrder>
      >({
        variables: {
          methodPath: 'cart.show',
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

      spreeCartResponse = spreeCartShowSuccessResponse
    } catch (fetchCartError) {
      if (
        !(fetchCartError instanceof FetcherError) ||
        fetchCartError.status !== 404
      ) {
        throw fetchCartError
      }

      spreeCartResponse = null
    }
  }

  if (!spreeCartResponse || spreeCartResponse?.data.attributes.completed_at) {
    const { data: spreeCartCreateSuccessResponse } = await createEmptyCart(
      fetch
    )

    spreeCartResponse = spreeCartCreateSuccessResponse

    if (!isLoggedIn()) {
      setCartToken(spreeCartResponse.data.attributes.token)
    }
  }
  return spreeCartResponse
}

export default getCart
