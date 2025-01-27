import type { GraphQLFetcherResult } from '../types'
import { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import { IPaymentMethods } from '@spree/storefront-api-v2-sdk/types/interfaces/PaymentMethod'
import { PaymentMethod } from '../commerce/types/checkout'

const getPaymentMethods = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<PaymentMethod[]> => {
  const token: IToken | undefined = ensureIToken()

  if (!token) {
    return null
  } else {
    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<IPaymentMethods>
    >({
      variables: {
        methodPath: 'checkout.paymentMethods',
        arguments: [token, {}],
      },
    })
    return spreeSuccessResponse.data.map((paymentMethod): PaymentMethod => {
      return {
        id: paymentMethod.id,
        type: paymentMethod.attributes.type,
        name: paymentMethod.attributes.name,
        description: paymentMethod.attributes.description,
      }
    })
  }
}

export default getPaymentMethods
