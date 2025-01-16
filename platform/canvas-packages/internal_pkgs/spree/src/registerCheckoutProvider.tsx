import registerComponent, {
  ComponentMeta,
} from '@plasmicapp/host/registerComponent'
import { Registerable } from './registerable'
import React from 'react'
import useCheckout from './checkout/use-checkout'
import { DataProvider } from '@plasmicapp/host'

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
  importPath: 'commerce-spree',
  importName: 'CheckoutProvider',
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
