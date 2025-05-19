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
    action:
      | 'orderUpdate'
      | 'orderNext'
      | 'advance'
      | 'complete'
      | 'selectShippingMethod'
      | 'addPayment'
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
        action:
          | 'orderUpdate'
          | 'orderNext'
          | 'advance'
          | 'complete'
          | 'selectShippingMethod'
          | 'addPayment'
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
          action,
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

const addressFields =
  'firstName, lastName, company, streetNumber, apartments, city, zipCode, phone, state, and country (country ISO code)'

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
        name: 'specialInstructions',
        displayName: 'Special instructions',
        type: 'string',
      },
      {
        name: 'billingAddress',
        displayName: 'Billing address',
        type: {
          type: 'object',
          helpText: `The billing address object. It can have ${addressFields} fields.`,
        },
      },
      {
        name: 'shippingAddress',
        displayName: 'Shipping address',
        type: {
          type: 'object',
          helpText: `The shipping address object. It can have ${addressFields} fields.`,
        },
      },
      {
        name: 'payments',
        displayName: 'Payments',
        type: {
          type: 'array',
          helpText:
            "A list of payment objects. Each object should have a 'paymentMethodId' field.",
        },
      },
      {
        name: 'shipments',
        displayName: 'Shipments',
        type: {
          type: 'array',
          helpText:
            'A list of shipment objects. Each object should have id and selectedShippingRateId fields.',
        },
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
          defaultValue: 'orderUpdate',
          required: true,
        },
      },
    ],
  },
}
