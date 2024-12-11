/*
  Forked from https://github.com/vercel/commerce/tree/main/packages/saleor/src
  Changes: None
*/

import { CartType as Core } from '@plasmicpkgs/commerce'



export type SaleorCart = {}
export type LineItem = Core.LineItem;

/**
 * Extend core cart types
 */

export type Cart = Core.Cart & {
  lineItems: Core.LineItem[]
  url?: string
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