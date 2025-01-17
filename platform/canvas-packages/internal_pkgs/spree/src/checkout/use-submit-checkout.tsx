import type { SubmitCheckoutHook } from '../commerce/types/checkout'
import type { MutationHook } from '../commerce/utils/types'

import { useMemo } from 'react'
import useSubmitCheckout, {
  UseSubmitCheckout,
} from '../commerce/checkout/use-submit-checkout'
import ensureIToken from '../utils/tokens/ensure-itoken'
import { IToken } from '@spree/storefront-api-v2-sdk/types/interfaces/Token'
import { FetcherError, ValidationError } from '@plasmicpkgs/commerce'
import createEmptyCart from '../utils/create-empty-cart'
import { setCartToken } from '../utils/tokens/cart-token'
import { OrderUpdate } from '@spree/storefront-api-v2-sdk/types/interfaces/Checkout'
import { GraphQLFetcherResult } from '../types'
import { IOrder } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'
import isLoggedIn from '../utils/tokens/is-logged-in'
import debounce from 'lodash.debounce'
import type { AddressFields } from '../commerce/types/customer/address'
import { IPayment } from '@spree/storefront-api-v2-sdk/types/interfaces/attributes/Payment'
import normalizeCart from '../utils/normalizations/normalize-cart'

export default useSubmitCheckout as UseSubmitCheckout<typeof handler>

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

export const handler: MutationHook<SubmitCheckoutHook> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'checkout',
    query: 'orderUpdate',
  },
  async fetcher({ input, options, fetch }) {
    console.info(
      'useSubmitCheckout fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )

    let spreeCartResponse: IOrder | null

    const {
      email,
      special_instructions,
      billing_address,
      shipping_address,
      payments,
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

      const orderUpdateParameters: OrderUpdate = {
        order: {
          email,
          special_instructions,
          bill_address_attributes: buildAddress(billing_address),
          ship_address_attributes: buildAddress(shipping_address),
          payments_attributes,
        },
      }

      const { data: spreeSuccessResponse } = await fetch<
        GraphQLFetcherResult<IOrder>
      >({
        variables: {
          methodPath: 'checkout.orderUpdate',
          arguments: [token, orderUpdateParameters],
          include: [
            'line_items',
            'line_items.variant',
            'line_items.variant.product',
            'line_items.variant.product.images',
            'line_items.variant.images',
            'line_items.variant.option_values',
            'line_items.variant.product.option_types',
          ].join(','),
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
  },
  useHook: ({ fetch }) => {
    const useWrappedHook: ReturnType<
      MutationHook<SubmitCheckoutHook>['useHook']
    > = (context) => {
      return useMemo(
        () =>
          debounce(async (input: SubmitCheckoutHook['actionInput']) => {
            const {
              email,
              special_instructions,
              billing_address,
              shipping_address,
              payments,
            } = input

            if (
              !email &&
              !special_instructions &&
              !billing_address &&
              !shipping_address &&
              !payments
            ) {
              throw new ValidationError({
                message:
                  'email or special_instructions or billing_address or shipping_address or payments needs to be provided.',
              })
            }

            const data = await fetch({
              input: {
                email,
                special_instructions,
                billing_address,
                shipping_address,
                payments,
              },
            })
            return data
          }),
        [context]
      )
    }

    return useWrappedHook
  },
}
