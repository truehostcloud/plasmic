import type { fetchResponseKey } from '../utils/create-customized-fetch-fetcher'
import type {
  JsonApiDocument,
  JsonApiListResponse,
  JsonApiSingleResponse,
} from '@spree/storefront-api-v2-sdk/types/interfaces/JsonApi'
import type { ResultResponse } from '@spree/storefront-api-v2-sdk/types/interfaces/ResultResponse'
import type { ProductOption } from '@plasmicpkgs/commerce'
import type { FetchOptions } from '@vercel/fetch'

export type UnknownObjectValues = Record<string, unknown>

export type NonUndefined<T> = T extends undefined ? never : T

export type ValueOf<T> = T[keyof T]

export type SpreeSdkResponse = JsonApiSingleResponse | JsonApiListResponse

export type SpreeSdkResponseWithRawResponse = SpreeSdkResponse & {
  [fetchResponseKey]: Response
}

export type SpreeSdkResultResponseSuccessType = SpreeSdkResponseWithRawResponse

export type SpreeSdkMethodReturnType<
  ResultResponseSuccessType extends SpreeSdkResultResponseSuccessType = SpreeSdkResultResponseSuccessType
> = Promise<ResultResponse<ResultResponseSuccessType>>

export type SpreeSdkMethod<
  ResultResponseSuccessType extends SpreeSdkResultResponseSuccessType = SpreeSdkResultResponseSuccessType
> = (...args: any[]) => SpreeSdkMethodReturnType<ResultResponseSuccessType>

export type SpreeSdkVariables = {
  methodPath: string
  arguments: any[]
}

export type FetcherVariables = SpreeSdkVariables & {
  refreshExpiredAccessToken: boolean
  replayUnauthorizedRequest: boolean
}

export interface ImageStyle {
  url: string
  width: string
  height: string
  size: string
}

export interface SpreeProductImage extends JsonApiDocument {
  attributes: {
    position: number
    alt: string
    original_url: string
    transformed_url: string | null
    styles: ImageStyle[]
  }
}

export interface SpreeTaxonImage extends JsonApiDocument {
  attributes: {
    position: number
    alt: string
    original_url: string
    transformed_url: string | null
    styles: ImageStyle[]
  }
}

export interface OptionTypeAttr extends JsonApiDocument {
  attributes: {
    name: string
    presentation: string
    position: number
    created_at: string
    updated_at: string
    filterable: boolean
  }
}

export interface LineItemAttr extends JsonApiDocument {
  attributes: {
    name: string
    quantity: number
    slug: string
    options_text: string
    price: string
    currency: string
    display_price: string
    total: string
    display_total: string
    adjustment_total: string
    display_adjustment_total: string
    additional_tax_total: string
    display_additional_tax_total: string
    discounted_amount: string
    display_discounted_amount: string
    pre_tax_amount: string
    display_pre_tax_amount: string
    promo_total: string
    display_promo_total: string
    included_tax_total: string
    display_inluded_tax_total: string
  }
}

export interface VariantAttr extends JsonApiDocument {
  attributes: {
    sku: string
    price: string
    currency: string
    display_price: string
    weight: string
    height: string
    width: string
    depth: string
    is_master: boolean
    options_text: string
    purchasable: boolean
    in_stock: boolean
    backorderable: boolean
  }
}

export interface ProductSlugAttr extends JsonApiDocument {
  attributes: {
    slug: string
  }
}
export interface IProductsSlugs extends JsonApiListResponse {
  data: ProductSlugAttr[]
}

export type ExpandedProductOption = ProductOption & { position: number }

export type UserOAuthTokens = {
  refreshToken: string
  accessToken: string
}

export type GraphQLFetcher<
  Data extends GraphQLFetcherResult = GraphQLFetcherResult,
  Variables = any
> = (
  query: string,
  queryData?: CommerceAPIFetchOptions<Variables>,
  fetchOptions?: FetchOptions
) => Promise<Data>

export interface GraphQLFetcherResult<Data = any> {
  data: Data
  res: Response
}

export interface CommerceAPIFetchOptions<Variables> {
  variables?: Variables
  preview?: boolean
}

export interface AddressAttr extends JsonApiDocument {
  attributes: {
    country_id: string
    state_id: string
    state_name: string
    address1: string
    address2: string
    city: string
    zipcode: string
    phone: string
    alternative_phone: string
    firstname: string
    lastname: string
    label: string
    company: string
    user_id: string
    public_metadata?: {
      [key: string]: string
    }
    private_metadata?: {
      [key: string]: string
    }
  }
}

export interface ShipmentAttr extends JsonApiDocument {
  attributes: {
    tracking: string
    number: string
    cost: string
    shipped_at: any
    state: string
    created_at: string
    updated_at: string
    adjustment_total: string
    additional_tax_total: string
    promo_total: string
    included_tax_total: string
    pre_tax_amount: string
    taxable_adjustment_total: string
    non_taxable_adjustment_total: string
    display_discounted_cost: string
    display_item_cost: string
    display_amount: string
    display_final_price: string
    display_cost: string
    tracking_url: any
    public_metadata?: {
      [key: string]: string
    }
    private_metadata?: {
      [key: string]: string
    }
  }
}

export interface PaymentAttr extends JsonApiDocument {
  attributes: {
    amount: string
    source_type: string
    state: string
    response_code: string
    avs_response: string
    created_at: string
    updated_at: string
    number: string
    cvv_response_code: string
    cvv_response_message: string
    display_amount: string
  }
}

export interface ShippingRateAttr extends JsonApiDocument {
  attributes: {
    name: string
    selected: boolean
    final_price: string
    display_final_price: string
    cost: string
    display_cost: string
    tax_amount: string
    display_tax_amount: string
    shipping_method_id: string
    free: boolean
  }
}
