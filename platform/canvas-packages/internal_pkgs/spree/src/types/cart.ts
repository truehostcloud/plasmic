/*
  Forked from https://github.com/vercel/commerce/tree/main/packages/saleor/src
  Changes: None
*/
import type { Image, Measurement } from './common'
import { CartType as Core } from '@plasmicpkgs/commerce'
import { AddressFields } from '../commerce/types/customer/address'

export type SaleorCart = {}
export type LineItem = Core.LineItem

/**
 * Extend core cart types
 */

export type Cart = Core.Cart & {
  lineItems: Core.LineItem[]
  url?: string
  shippingAddress?: AddressFields
  billingAddress?: AddressFields
  payments?: Payment[]
  shipments?: Shipment[]
  number?: string
  itemTotal?: string
  total?: string
  shipTotal?: string
  adjustmentTotal?: string
  includedTaxTotal?: string
  additionalTaxTotal?: string
  displayAdditionalTaxTotal?: string
  displayIncludedTaxTotal?: string
  taxTotal?: string
  email?: string
  displayItemTotal?: string
  displayShipTotal?: string
  displayAdjustmentTotal?: string
  displayTaxTotal?: string
  promoTotal?: string
  displayPromoTotal?: string
  itemCount?: number
  specialInstructions?: string
  displayTotal?: string
  preTaxItemAmount?: string
  displayPreTaxItemAmount?: string
  preTaxTotal?: string
  displayPreTaxTotal?: string
}

export type CartTypes = Core.CartTypes

export type CartHooks = Core.CartHooks<CartTypes>

export type GetCartHook = CartHooks['getCart']
export type AddItemHook = CartHooks['addItem']
export type UpdateItemHook = CartHooks['updateItem']
export type RemoveItemHook = CartHooks['removeItem']

export type CartSchema = Core.CartSchema<CartTypes>

export type CartHandlers = Core.CartHandlers<CartTypes>

export type GetCartHandler = CartHandlers['getCart']
export type AddItemHandler = CartHandlers['addItem']
export type UpdateItemHandler = CartHandlers['updateItem']
export type RemoveItemHandler = CartHandlers['removeItem']

export interface ProductVariant {
  /**
   *  The unique identifier for the variant.
   */
  id: string
  /**
   * The SKU (stock keeping unit) associated with the product variant.
   */
  sku: string
  /**
   * The product variant’s name, or the product's name.
   */
  name: string
  /**
   * The product variant’s price after all discounts are applied.
   */
  price: number
  /**
   * The product variant’s price before discounts are applied.
   */
  listPrice: number
  /**
   * Indicates if the variant is available for sale.
   */
  availableForSale?: boolean
  /**
   * Whether a customer needs to provide a shipping address when placing
   * an order for the product variant.
   */
  requiresShipping: boolean
  /**
   * The image associated with the variant.
   */
  image?: Image
  /**
   * The variant's weight. If a weight was not explicitly specified on the
   * variant, this will be the product's weight.
   */
  weight?: Measurement
  /**
   * The variant's height. If a height was not explicitly specified on the
   * variant, this will be the product's height.
   */
  height?: Measurement
  /**
   * The variant's width. If a width was not explicitly specified on the
   * variant, this will be the product's width.
   */
  width?: Measurement
  /**
   * The variant's depth. If a depth was not explicitly specified on the
   * variant, this will be the product's depth.
   */
  depth?: Measurement
}

export interface SelectedOption {
  /**
   * The unique identifier for the option.
   */
  id?: string
  /**
   *  The product option’s name, such as "Color" or "Size".
   */
  name: string
  /**
   * The product option’s value, such as "Red" or "XL".
   */
  value: string
}

export interface Shipment {
  tracking?: string
  number?: string
  cost?: string
  shippedAt?: any
  state?: string
  createdAt?: string
  updatedAt?: string
  adjustmentTotal?: string
  additionalTaxTotal?: string
  promoTotal?: string
  includedTaxTotal?: string
  preTaxAmount?: string
  taxableAdjustmentTotal?: string
  nonTaxableAdjustmentTotal?: string
  displayDiscountedCost?: string
  displayItemCost?: string
  displayAmount?: string
  displayFinalPrice?: string
  displayCost?: string
  trackingUrl?: any
}

export interface Payment {
  amount?: number
  sourceType?: string
  state?: string
  responseCode?: string
  avsResponse?: string
  createdAt?: string
  updatedAt?: string
  number?: string
  cvvResponseCode?: string
  cvvResponseMessage?: string
  displayAmount?: string
}

export interface ShippingRate {
  name?: string
  selected?: boolean
  finalPrice?: string
  displayFinalPrice?: string
  cost?: string
  displayCost?: string
  taxAmount?: string
  displayTaxAmount?: string
  shippingMethodId?: string
  free?: boolean
}

export interface PaymentMethod {
  type?: string
  name?: string
  description?: string
  publicMetadata?: object
  preferences?: object
}
