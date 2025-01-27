import { GraphQLFetcherResult, ShippingRateAttr } from '../types'
import { HookFetcherContext } from '@plasmicpkgs/commerce'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import { IShippingMethods } from '@spree/storefront-api-v2-sdk/types/interfaces/ShippingMethod'
import { jsonApi } from '@spree/storefront-api-v2-sdk'
import { OrderShipment, ShippingRate } from '../commerce/types/checkout'

const getShippingRates = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<OrderShipment[]> => {
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

    return spreeSuccessResponse.data.map((shippingMethod): OrderShipment => {
      const relationships = shippingMethod.relationships
      const shippingRates: ShippingRate[] = relationships.shipping_rates?.data
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
                shippingMethodId: shippingMethod.id,
                free: shippingRate.attributes.free,
              }
            })
        : null
      return {
        id: shippingMethod.id,
        number: shippingMethod.attributes.number,
        finalPrice: shippingMethod.attributes.final_price,
        displayFinalPrice: shippingMethod.attributes.display_final_price,
        state: shippingMethod.attributes.state,
        shippedAt: shippingMethod.attributes.shipped_at,
        trackingUrl: shippingMethod.attributes.tracking_url,
        free: shippingMethod.attributes.free,
        shippingRates,
      }
    })
  }
}

export default getShippingRates
