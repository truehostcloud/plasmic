import type { AddressFields } from './customer/address'
import type { Card, CardFields } from './customer/card'
import type { LineItem } from './cart'

export interface Checkout {
  /**
   * Indicates if the checkout has payment iformation collected.
   */
  hasPayment: boolean
  /**
   * Indicates if the checkout has shipping information collected.
   */
  hasShipping: boolean
  /**
   * The unique identifier for the address that the customer has selected for shipping.
   */
  addressId: string
  /**
   * The list of payment cards that the customer has available.
   */
  payments?: Card[]
  /**
   * The unique identifier of the card that the customer has selected for payment.
   */
  cardId?: string
  /**
   * List of items in the checkout.
   */
  lineItems?: LineItem[]
}

export interface Payment {
  paymentMethodId: string
}

export interface CheckoutBody {
  /**
   * The email assigned to this cart.
   */
  email: string
  /**
   * The unique identifier for the cart.
   */
  cartId?: string
  /**
   * The Card information.
   * @see CardFields
   */
  card?: CardFields
  /**
   * The billing Address information.
   * @see AddressFields
   */
  billing_address?: AddressFields
  /**
   * The shipping Address information.
   * @see AddressFields
   */
  shipping_address?: AddressFields
  /**
   * The special instructions for the order.
   */
  special_instructions?: string
  /**
   * The list of payments.
   */
  payments?: Payment[]
}

export type CheckoutTypes = {
  checkout: Checkout
  checkoutBody: CheckoutBody
}

export type SubmitCheckoutHook<T extends CheckoutTypes = CheckoutTypes> = {
  data: T['checkout'] | null
  input?: T['checkoutBody']
  fetcherInput: T['checkoutBody']
  body: { item: T['checkoutBody'] }
  actionInput: T['checkoutBody']
}

export type GetCheckoutHook = {
  data: Checkout | null
  input: {}
  fetcherInput: { cartId?: string }
  swrState: { isEmpty: boolean }
}

export type CheckoutHooks = {
  submitCheckout?: SubmitCheckoutHook
  getCheckout: GetCheckoutHook
}

export type GetCheckoutHandler = GetCheckoutHook & {
  body: { cartId?: string }
}

export type SubmitCheckoutHandler = SubmitCheckoutHook & {
  body: { cartId: string }
}

export type CheckoutHandlers = {
  getCheckout: GetCheckoutHandler
  submitCheckout?: SubmitCheckoutHandler
}

export type CheckoutSchema = {
  endpoint: {
    options: {}
    handlers: CheckoutHandlers
  }
}
