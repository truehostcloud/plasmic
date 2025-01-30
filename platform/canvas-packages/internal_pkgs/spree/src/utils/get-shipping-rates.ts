import { GraphQLFetcherResult, ShippingRateAttr } from '../types'
import { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import { IShippingMethods } from '@spree/storefront-api-v2-sdk/types/interfaces/ShippingMethod'
import { jsonApi } from '@spree/storefront-api-v2-sdk'
import { ShippingRate } from '../commerce/types/checkout'

const getShippingRates = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<ShippingRate[]> => {
  const token: IToken | undefined = ensureIToken()

  if (!token) {
    return null
  } else {
    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<IShippingMethods>
    >({
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

    let ShippingRates = []

    spreeSuccessResponse.data.forEach((shippingMethod) => {
      const relationships = shippingMethod.relationships
      const shipmentShippingRates: ShippingRate[] = relationships.shipping_rates
        ?.data
        ? jsonApi
            .findRelationshipDocuments<ShippingRateAttr>(
              spreeSuccessResponse,
              shippingMethod,
              'shipping_rates'
            )
            .map((shippingRate): ShippingRate => {
              return {
                id: shippingRate.id,
                name: shippingRate.attributes.name,
                selected: shippingRate.attributes.selected,
                finalPrice: shippingRate.attributes.final_price,
                displayFinalPrice: shippingRate.attributes.display_final_price,
                cost: shippingRate.attributes.cost,
                displayCost: shippingRate.attributes.display_cost,
                taxAmount: shippingRate.attributes.tax_amount,
                displayTaxAmount: shippingRate.attributes.display_tax_amount,
                shippingMethodId: shippingRate.attributes.shipping_method_id,
                free: shippingRate.attributes.free,
              }
            })
        : null
      ShippingRates = ShippingRates.concat(shipmentShippingRates)
    })
    return ShippingRates
  }
}

export default getShippingRates
