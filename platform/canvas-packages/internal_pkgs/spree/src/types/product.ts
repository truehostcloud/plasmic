import { Image } from './common'

export interface ProductPrice {
  /**
   * The price after all discounts are applied.
   */
  value: number
  /**
   * The currency code for the price. This is a 3-letter ISO 4217 code.
   * @example USD
   */
  currencyCode?: 'USD' | 'EUR' | 'ARS' | 'GBP' | string
  /**
   * The retail price of the product. This can be used to mark a product as on sale, when `retailPrice` is higher than the price a.k.a `value`.
   */
  retailPrice?: number
}

export interface ProductOption {
  __typename?: 'MultipleChoiceOption'
  /**
   * The unique identifier for the option.
   */
  id: string
  /**
   * The product option’s name.
   * @example `Color` or `Size`
   */
  displayName: string
  /**
   * List of option values.
   * @example `["Red", "Green", "Blue"]`
   */
  values: ProductOptionValues[]
}

export interface ProductOptionValues {
  /**
   * A string that uniquely identifies the option value.
   */
  label: string
  /**
   * List of hex colors used to display the actual colors in the swatches instead of the name.
   */
  hexColors?: string[]
}

export interface ProductVariant {
  /**
   *  The unique identifier for the variant.
   */
  id: string
  /**
   * The SKU (stock keeping unit) associated with the product variant.
   */
  sku?: string
  /**
   * The product variant’s name, or the product's name.
   */
  name?: string
  /**
   * List of product options.
   */
  options: ProductOption[]
  /**
   * The product variant’s price after all discounts are applied.
   */
  price?: ProductPrice
  /**
   * The retail price of the product. This can be used to mark a product as on sale, when `retailPrice` is higher than the `price`.
   */
  retailPrice?: ProductPrice
  /**
   * Indicates if the variant is available for sale.
   */
  availableForSale?: boolean
  /**
   * Whether a customer needs to provide a shipping address when placing an order for the product variant.
   */
  requiresShipping?: boolean
  /**
   * The image associated with the variant.
   */
  image?: Image
}