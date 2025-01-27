import registerComponent, {
  ComponentMeta,
} from '@plasmicapp/host/registerComponent'
import { Registerable } from './registerable'
import React, { useMemo } from 'react'
import useCheckout from './checkout/use-checkout'
import {
  DataProvider,
  GlobalActionDict,
  GlobalActionsProvider,
} from '@plasmicapp/host'
import useSubmitCheckout from './commerce/checkout/use-submit-checkout'
import type { AddressFields } from './commerce/types/customer/address'
import { Payment, Shipment } from './commerce/types/checkout'
import { globalActionsRegistrations as baseGlobalActionsRegistrations } from '@plasmicpkgs/commerce'
import { GlobalActionRegistration } from '@plasmicapp/host/registerGlobalContext'

export const checkoutProviderMeta: ComponentMeta<
  React.PropsWithChildren<object>
> = {
  name: 'plasmic-commerce-spree-checkout',
  displayName: 'Checkout Provider',
  description:
    'Use this to create bespoke checkout UI. Inside Checkout Provider, use dynamic values to access checkout data.',
  props: {
    children: 'slot',
  },
  providesData: true,
  importPath: 'commerce-spree',
  importName: 'CheckoutProvider',
}

interface CheckoutActions extends GlobalActionDict {
  submitCheckout: (
    email: string,
    specialInstructions: string,
    billingAddress: AddressFields,
    shippingAddress: AddressFields,
    payments: Payment[],
    shipments: Shipment[],
    shippingMethodId: string,
    paymentMethodId: string,
    onSuccessAction: 'orderNext' | 'advance' | 'complete' | null
  ) => void
}

export function CheckoutActionsProvider(
  props: React.PropsWithChildren<{
    globalContextName: string
  }>
) {
  const submitCheckout = useSubmitCheckout()
  const actions: CheckoutActions = useMemo(
    () => ({
      submitCheckout(
        email: string,
        specialInstructions: string,
        billingAddress: AddressFields,
        shippingAddress: AddressFields,
        payments: Payment[],
        shipments: Shipment[],
        shippingMethodId: string,
        paymentMethodId: string,
        onSuccessAction: 'orderNext' | 'advance' | 'complete' | null
      ) {
        submitCheckout({
          email,
          specialInstructions,
          billingAddress,
          shippingAddress,
          payments,
          shipments,
          shippingMethodId,
          paymentMethodId,
          onSuccessAction,
        })
      },
    }),
    [submitCheckout]
  )

  return (
    <GlobalActionsProvider
      contextName={props.globalContextName}
      actions={actions}
    >
      {props.children}
    </GlobalActionsProvider>
  )
}

export function CheckoutProvider(props: React.PropsWithChildren<object>) {
  const { data } = useCheckout()
  return (
    <DataProvider data={data} name="checkout">
      {props.children}
    </DataProvider>
  )
}

export function registerCheckoutProvider(
  loader?: Registerable,
  customCheckoutMeta?: ComponentMeta<React.PropsWithChildren<object>>
) {
  const doRegisterComponent: typeof registerComponent = (...args) =>
    loader ? loader.registerComponent(...args) : registerComponent(...args)
  doRegisterComponent(
    CheckoutProvider,
    customCheckoutMeta ?? checkoutProviderMeta
  )
}

const addressFields: Record<string, { displayName: string; type: any }> = {
  type: {
    displayName: 'Type',
    type: {
      type: 'choice',
      multiSelect: false,
      options: [
        { value: 'billing', label: 'Billing' },
        { value: 'shipping', label: 'Shipping' },
      ],
    },
  },
  firstName: {
    displayName: 'First name',
    type: 'string',
  },
  lastName: {
    displayName: 'Last name',
    type: 'string',
  },
  company: {
    displayName: 'Company',
    type: 'string',
  },
  streetNumber: {
    displayName: 'Street number',
    type: 'string',
  },
  apartments: {
    displayName: 'Apartments',
    type: 'string',
  },
  zipCode: {
    displayName: 'Zip code',
    type: 'string',
  },
  city: {
    displayName: 'City',
    type: 'string',
  },
  state: {
    displayName: 'State',
    type: 'string',
  },
  country: {
    displayName: 'Country',
    type: 'string',
  },
  phone: {
    displayName: 'Phone',
    type: 'string',
  },
}

export const globalActionsRegistrations: Record<
  string,
  GlobalActionRegistration<any>
> = {
  ...baseGlobalActionsRegistrations,
  submitCheckout: {
    displayName: 'Submit checkout',
    parameters: [
      {
        name: 'email',
        displayName: 'Email',
        type: 'string',
      },
      {
        name: 'special_instructions',
        displayName: 'Special instructions',
        type: 'string',
      },
      {
        name: 'billing_address',
        displayName: 'Billing address',
        type: {
          type: 'object',
          fields: addressFields,
        },
      },
      {
        name: 'shipping_address',
        displayName: 'Shipping address',
        type: {
          type: 'object',
          fields: addressFields,
        },
      },
      {
        name: 'payments',
        displayName: 'Payments',
        type: 'object',
      },
      {
        name: 'shipments',
        displayName: 'Shipments',
        type: 'object',
      },
      {
        name: 'shippingMethodId',
        displayName: 'Shipping method ID',
        type: 'string',
      },
      {
        name: 'paymentMethodId',
        displayName: 'Payment method ID',
        type: 'string',
      },
      {
        name: 'action',
        displayName: 'Action',
        type: {
          type: 'choice',
          multiSelect: false,
          options: [
            { value: 'orderUpdate', label: 'Update checkout' },
            { value: 'orderNext', label: 'Next' },
            { value: 'advance', label: 'Advance' },
            { value: 'complete', label: 'Complete' },
            { value: 'selectShippingMethod', label: 'Select shipping method' },
            { value: 'addPayment', label: 'Add payment' },
          ],
        },
      },
      {
        name: 'onSuccessAction',
        displayName: 'On success action',
        type: {
          type: 'choice',
          multiSelect: false,
          options: [
            { value: 'orderNext', label: 'Next' },
            { value: 'advance', label: 'Advance' },
            { value: 'complete', label: 'Complete' },
            { value: 'null', label: 'None' },
          ],
        },
      },
    ],
  },
}
