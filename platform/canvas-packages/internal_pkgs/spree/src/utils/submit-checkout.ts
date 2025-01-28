import type { GraphQLFetcherResult } from '../types'
import {
  FetcherError,
  HookFetcherContext,
  ValidationError,
} from '@plasmicpkgs/commerce'
import type { IOrder } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'
import type { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import ensureIToken from './tokens/ensure-itoken'
import createEmptyCart from './create-empty-cart'
import isLoggedIn from './tokens/is-logged-in'
import { setCartToken } from './tokens/cart-token'
import { IPayment } from '@spree/storefront-api-v2-sdk/types/interfaces/attributes/Payment'
import normalizeCart from './normalizations/normalize-cart'
import type { AddressFields } from '../commerce/types/customer/address'
import { Checkout, CheckoutBody } from '../commerce/types/checkout'

function buildAddress(address: AddressFields) {
  return {
    firstname: address?.firstName,
    lastname: address?.lastName,
    address1: address?.streetNumber,
    address2: address?.apartments,
    city: address?.city,
    zipcode: address?.zipCode,
    phone: address?.phone,
    state_name: address?.state,
    country_iso: address?.country,
  }
}

const submitCheckout = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch'],
  input: CheckoutBody
): Promise<Checkout> => {
  let spreeCartResponse: IOrder | null

  const {
    email,
    specialInstructions,
    billingAddress,
    shippingAddress,
    payments,
    shipments,
    shippingMethodId,
    paymentMethodId,
    action,
  } = input

  if (!email) {
    throw new ValidationError({
      message: 'email needs to be provided.',
    })
  }

  let token: IToken | undefined = ensureIToken()

  if (!token) {
    const { data: spreeCartCreateSuccessResponse } = await createEmptyCart(
      fetch
    )

    setCartToken(spreeCartCreateSuccessResponse.data.attributes.token)
    token = ensureIToken()
  }

  try {
    const payments_attributes = payments?.map((payment) => ({
      payment_method_id: payment.paymentMethodId,
    })) as IPayment[]
    const shipments_attributes = shipments?.map((shipment) => ({
      id: shipment.id,
      selected_shipping_rate_id: shipment.selectedShippingRateId,
    }))

    const includeParams = [
      'line_items',
      'line_items.variant',
      'line_items.variant.product',
      'line_items.variant.product.images',
      'line_items.variant.images',
      'line_items.variant.option_values',
      'line_items.variant.product.option_types',
    ].join(',')

    const orderUpdateParameters = {
      order: {
        email,
        special_instructions: specialInstructions,
        bill_address_attributes: buildAddress(billingAddress),
        ship_address_attributes: buildAddress(shippingAddress),
        payments_attributes,
        shipments_attributes,
      },
      shipping_method_id: shippingMethodId,
      payment_method_id: paymentMethodId,
      include: includeParams,
    }

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<IOrder>
    >({
      variables: {
        methodPath: `checkout.${action}`,
        arguments: [token, orderUpdateParameters],
      },
    })
    spreeCartResponse = spreeSuccessResponse
  } catch (updateItemError) {
    if (
      updateItemError instanceof FetcherError &&
      updateItemError.status === 404
    ) {
      const { data: spreeRetroactiveCartCreateSuccessResponse } =
        await createEmptyCart(fetch)

      if (!isLoggedIn()) {
        setCartToken(
          spreeRetroactiveCartCreateSuccessResponse.data.attributes.token
        )
      }

      // Return an empty cart. The user has to update the item again.
      // This is going to be a rare situation.

      spreeCartResponse = spreeRetroactiveCartCreateSuccessResponse
    }

    throw updateItemError
  }
  const cart = normalizeCart(spreeCartResponse, spreeCartResponse.data)
  return {
    hasPayment: false,
    hasShipping: false,
    addressId: null,
    payments: [],
    cardId: null,
    lineItems: cart.lineItems,
  }
}

export default submitCheckout
