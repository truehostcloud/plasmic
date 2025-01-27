import type { GraphQLFetcherResult } from '../types'
import { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import { IPaymentMethods } from '@spree/storefront-api-v2-sdk/types/interfaces/PaymentMethod'

const getPaymentMethods = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<IPaymentMethods> => {
  const token: IToken | undefined = ensureIToken()

  if (!token) {
    return null
  } else {
    const { data } = await fetch<GraphQLFetcherResult<IPaymentMethods>>({
      variables: {
        methodPath: 'checkout.paymentMethods',
        arguments: [token, {}],
      },
    })
    return data
  }
}

export default getPaymentMethods
