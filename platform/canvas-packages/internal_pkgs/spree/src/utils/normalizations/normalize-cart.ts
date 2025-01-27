import type { ProductVariant } from '../../types/cart'
import {
  Cart,
  LineItem,
  SelectedOption,
  Payment,
  Shipment,
} from '../../types/cart'
import MissingLineItemVariantError from '../../errors/MissingLineItemVariantError'
import { requireConfigValue } from '../../isomorphic-config'
import type { OrderAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Order'
import type { ProductAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Product'
import type { Image } from '../../types/common'
import { jsonApi } from '@spree/storefront-api-v2-sdk'
import createGetAbsoluteImageUrl from '../create-get-absolute-image-url'
import getMediaGallery from '../get-media-gallery'
import type {
  AddressAttr,
  LineItemAttr,
  OptionTypeAttr,
  SpreeProductImage,
  SpreeSdkResponse,
  VariantAttr,
  ShipmentAttr,
  PaymentAttr,
} from '../../types'
import { AddressFields } from '../../commerce/types/customer/address'

const placeholderImage = requireConfigValue('lineItemPlaceholderImageUrl') as
  | string
  | false

const isColorProductOption = (productOptionType: OptionTypeAttr) => {
  return productOptionType.attributes.presentation === 'Color'
}

const normalizeVariant = (
  spreeSuccessResponse: SpreeSdkResponse,
  spreeVariant: VariantAttr
): ProductVariant => {
  const spreeProduct = jsonApi.findSingleRelationshipDocument<ProductAttr>(
    spreeSuccessResponse,
    spreeVariant,
    'product'
  )

  if (spreeProduct === null) {
    throw new MissingLineItemVariantError(
      `Couldn't find product for variant with id ${spreeVariant.id}.`
    )
  }
  const spreeVariantImageRecords =
    jsonApi.findRelationshipDocuments<SpreeProductImage>(
      spreeSuccessResponse,
      spreeVariant,
      'images'
    )
  let lineItemImage: Image

  const variantImage = getMediaGallery(
    spreeVariantImageRecords,
    createGetAbsoluteImageUrl(requireConfigValue('imageHost') as string)
  )[0]
  if (variantImage) {
    lineItemImage = variantImage
  } else {
    const spreeProductImageRecords =
      jsonApi.findRelationshipDocuments<SpreeProductImage>(
        spreeSuccessResponse,
        spreeProduct,
        'images'
      )

    lineItemImage = getMediaGallery(
      spreeProductImageRecords,
      createGetAbsoluteImageUrl(requireConfigValue('imageHost') as string)
    )[0]
  }

  const image: Image =
    lineItemImage ??
    (placeholderImage === false ? undefined : { url: placeholderImage })

  return {
    id: spreeVariant.id,
    sku: spreeVariant.attributes.sku,
    name: spreeProduct.attributes.name,
    requiresShipping: true,
    price: parseFloat(spreeVariant.attributes.price),
    listPrice: parseFloat(spreeVariant.attributes.price),
    image,
    availableForSale: spreeVariant.attributes.purchasable,
    ...(spreeVariant.attributes.weight === '0.0'
      ? {}
      : {
          weight: {
            value: parseFloat(spreeVariant.attributes.weight),
            unit: 'KILOGRAMS',
          },
        }),
    // TODO: Add height, width and depth when Measurement type allows distance measurements.
  }
}

const normalizeLineItem = (
  spreeSuccessResponse: SpreeSdkResponse,
  spreeLineItem: LineItemAttr
): LineItem => {
  const variant = jsonApi.findSingleRelationshipDocument<VariantAttr>(
    spreeSuccessResponse,
    spreeLineItem,
    'variant'
  )

  if (variant === null) {
    throw new MissingLineItemVariantError(
      `Couldn't find variant for line item with id ${spreeLineItem.id}.`
    )
  }

  const product = jsonApi.findSingleRelationshipDocument<ProductAttr>(
    spreeSuccessResponse,
    variant,
    'product'
  )

  if (product === null) {
    throw new MissingLineItemVariantError(
      `Couldn't find product for variant with id ${variant.id}.`
    )
  }

  // CartItem.tsx expects path without a '/' prefix unlike pages/product/[slug].tsx and others.
  const path = `${product.attributes.slug}`

  const spreeOptionValues = jsonApi.findRelationshipDocuments(
    spreeSuccessResponse,
    variant,
    'option_values'
  )

  const options: SelectedOption[] = spreeOptionValues.map(
    (spreeOptionValue) => {
      const spreeOptionType =
        jsonApi.findSingleRelationshipDocument<OptionTypeAttr>(
          spreeSuccessResponse,
          spreeOptionValue,
          'option_type'
        )

      if (spreeOptionType === null) {
        throw new MissingLineItemVariantError(
          `Couldn't find option type of option value with id ${spreeOptionValue.id}.`
        )
      }

      const label = isColorProductOption(spreeOptionType)
        ? spreeOptionValue.attributes.name
        : spreeOptionValue.attributes.presentation

      return {
        id: spreeOptionValue.id,
        name: spreeOptionType.attributes.presentation,
        value: label,
      }
    }
  )

  return {
    id: spreeLineItem.id,
    variantId: variant.id,
    productId: product.id,
    name: spreeLineItem.attributes.name,
    quantity: spreeLineItem.attributes.quantity,
    discounts: [], // TODO: Implement when the template starts displaying them.
    path,
    variant: normalizeVariant(spreeSuccessResponse, variant),
    options,
  }
}

const normalizeAddress = (
  address: AddressAttr,
  type: string
): AddressFields => {
  return {
    type,
    firstName: address.attributes.firstname,
    lastName: address.attributes.lastname,
    company: address.attributes.company,
    streetNumber: address.attributes.address1,
    city: address.attributes.city,
    state: address.attributes.state_name,
    country: address.attributes.country_id,
    zipCode: address.attributes.zipcode,
    phone: address.attributes.phone,
  }
}

const normalizePayment = (payment: PaymentAttr): Payment => {
  return {
    amount: parseFloat(payment.attributes.amount),
    sourceType: payment.attributes.source_type,
    state: payment.attributes.state,
    responseCode: payment.attributes.response_code,
    avsResponse: payment.attributes.avs_response,
    createdAt: payment.attributes.created_at,
    updatedAt: payment.attributes.updated_at,
    number: payment.attributes.number,
    cvvResponseCode: payment.attributes.cvv_response_code,
    cvvResponseMessage: payment.attributes.cvv_response_message,
    displayAmount: payment.attributes.display_amount,
  }
}

const normalizeShipment = (shipment: ShipmentAttr): Shipment => {
  return {
    tracking: shipment.attributes.tracking,
    number: shipment.attributes.number,
    cost: shipment.attributes.cost,
    shippedAt: shipment.attributes.shipped_at,
    state: shipment.attributes.state,
    createdAt: shipment.attributes.created_at,
    updatedAt: shipment.attributes.updated_at,
    adjustmentTotal: shipment.attributes.adjustment_total,
    additionalTaxTotal: shipment.attributes.additional_tax_total,
    promoTotal: shipment.attributes.promo_total,
    includedTaxTotal: shipment.attributes.included_tax_total,
    preTaxAmount: shipment.attributes.pre_tax_amount,
    taxableAdjustmentTotal: shipment.attributes.taxable_adjustment_total,
    nonTaxableAdjustmentTotal: shipment.attributes.non_taxable_adjustment_total,
    displayDiscountedCost: shipment.attributes.display_discounted_cost,
    displayItemCost: shipment.attributes.display_item_cost,
    displayAmount: shipment.attributes.display_amount,
    displayFinalPrice: shipment.attributes.display_final_price,
    displayCost: shipment.attributes.display_cost,
    trackingUrl: shipment.attributes.tracking_url,
  }
}

const normalizeCart = (
  spreeSuccessResponse: SpreeSdkResponse,
  spreeCart: OrderAttr
): Cart => {
  const lineItems = jsonApi
    .findRelationshipDocuments<LineItemAttr>(
      spreeSuccessResponse,
      spreeCart,
      'line_items'
    )
    .map((lineItem) => normalizeLineItem(spreeSuccessResponse, lineItem))

  const relationships = spreeCart.relationships

  const billingAddress = relationships.billing_address?.data
    ? normalizeAddress(
        jsonApi.findSingleRelationshipDocument<AddressAttr>(
          spreeSuccessResponse,
          spreeCart,
          'billing_address'
        ),
        'billing'
      )
    : null

  const shippingAddress = relationships.shipping_address?.data
    ? normalizeAddress(
        jsonApi.findSingleRelationshipDocument<AddressAttr>(
          spreeSuccessResponse,
          spreeCart,
          'shipping_address'
        ),
        'shipping'
      )
    : null

  const payments = jsonApi
    .findRelationshipDocuments<PaymentAttr>(
      spreeSuccessResponse,
      spreeCart,
      'payments'
    )
    .map((payment) => normalizePayment(payment))

  const shipments = jsonApi
    .findRelationshipDocuments<ShipmentAttr>(
      spreeSuccessResponse,
      spreeCart,
      'shipments'
    )
    .map((shipment) => normalizeShipment(shipment))

  return {
    id: spreeCart.id,
    createdAt: spreeCart.attributes.created_at.toString(),
    currency: { code: spreeCart.attributes.currency },
    taxesIncluded: true,
    lineItems,
    lineItemsSubtotalPrice: parseFloat(spreeCart.attributes.item_total),
    subtotalPrice: parseFloat(spreeCart.attributes.item_total),
    totalPrice: parseFloat(spreeCart.attributes.total),
    customerId: spreeCart.attributes.token,
    email: spreeCart.attributes.email,
    discounts: [], // TODO: Implement when the template starts displaying them.
    shippingAddress,
    billingAddress,
    payments,
    shipments,
  }
}

export { normalizeLineItem }

export default normalizeCart
