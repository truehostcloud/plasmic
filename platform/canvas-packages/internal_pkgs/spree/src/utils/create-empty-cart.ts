import type { GraphQLFetcherResult } from '../types'
import type { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IOrder } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'

const createEmptyCart = (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<GraphQLFetcherResult<IOrder>> => {
  const token: IToken | undefined = ensureIToken()

  return fetch<GraphQLFetcherResult<IOrder>>({
    variables: {
      methodPath: 'cart.create',
      arguments: [token],
    },
  })
}

export default createEmptyCart
