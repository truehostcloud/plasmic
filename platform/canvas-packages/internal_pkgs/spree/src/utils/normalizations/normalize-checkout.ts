import { Cart } from '../../types/cart'
import { Checkout } from '../../commerce/types/checkout'
import getShippingRates from '../get-shipping-rates'
import getPaymentMethods from '../get-payment-methods'
import { HookFetcherContext } from '@plasmicpkgs/commerce'

const normalizeCheckout = async (
  cart: Cart,
  fetch: HookFetcherContext<{
    data: any
  }>['fetch']
): Promise<Checkout> => {
  let shippingRates = null
  let paymentMethods = null
  if (cart.shippingAddress) {
    shippingRates = await getShippingRates(fetch)
    paymentMethods = await getPaymentMethods(fetch)
  }
  return {
    hasPayment: cart.payments.length > 0,
    hasShipping: cart.shipments.length > 0,
    addressId: null,
    payments: cart.payments,
    cardId: null,
    lineItems: cart.lineItems,
    billingAddress: cart.billingAddress,
    shippingAddress: cart.shippingAddress,
    shipments: cart.shipments,
    shippingRates,
    paymentMethods,
  }
}

export default normalizeCheckout
