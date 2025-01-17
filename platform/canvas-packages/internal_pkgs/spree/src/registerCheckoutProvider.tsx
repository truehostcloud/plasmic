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
import { Payment } from './commerce/types/checkout'
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
    special_instructions: string,
    billing_address: AddressFields,
    shipping_address: AddressFields,
    payments: Payment[]
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
        special_instructions: string,
        billing_address: AddressFields,
        shipping_address: AddressFields,
        payments: Payment[]
      ) {
        submitCheckout({
          email,
          special_instructions,
          billing_address,
          shipping_address,
          payments,
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
        type: 'object',
      },
      {
        name: 'shipping_address',
        displayName: 'Shipping address',
        type: 'object',
      },
      {
        name: 'payments',
        displayName: 'Payments',
        type: 'object',
      },
    ],
  },
}
