import type { AddressFields } from './customer/address'
import type { CardFields } from './customer/card'
import type { LineItem } from './cart'
import {
  Cart,
  Payment as CartPayment,
  Shipment as CartShipment,
} from '../../types/cart'

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
   * The unique identifier of the card that the customer has selected for payment.
   */
  cardId?: string
  /**
   * List of items in the checkout.
   */
  lineItems?: LineItem[]
  shippingAddress?: AddressFields
  billingAddress?: AddressFields
  payments?: CartPayment[]
  shipments?: CartShipment[]
  paymentMethods?: PaymentMethod[]
  shippingRates?: ShippingRate[]
  cart: Cart
}

export interface Payment {
  paymentMethodId: string
}

export interface Shipment {
  id: string
  selectedShippingRateId: string
}

export interface OrderShipment {
  id: string
  number: string
  finalPrice: string
  displayFinalPrice: string
  state: string
  shippedAt: Date
  trackingUrl: string
  free: boolean
  shippingRates: ShippingRate[]
}

export interface ShippingRate {
  id: string
  name: string
  selected: boolean
  finalPrice: string
  displayFinalPrice: string
  cost: string
  displayCost: string
  taxAmount: string
  displayTaxAmount: string
  shippingMethodId: string
  free: boolean
}

export interface PaymentMethod {
  id: string
  type: string
  name: string
  description: string
  publicMetadata?: object
  preferences?: object
}

export interface CheckoutBody {
  /**
   * The email assigned to this cart.
   */
  email?: string
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
  billingAddress?: AddressFields
  /**
   * The shipping Address information.
   * @see AddressFields
   */
  shippingAddress?: AddressFields
  /**
   * The special instructions for the order.
   */
  specialInstructions?: string
  /**
   * The list of payments.
   */
  payments?: Payment[]
  shipments?: Shipment[]
  shippingMethodId?: string
  paymentMethodId?: string
  action:
    | 'orderUpdate'
    | 'orderNext'
    | 'advance'
    | 'complete'
    | 'selectShippingMethod'
    | 'addPayment'
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
