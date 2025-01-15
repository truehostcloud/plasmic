import registerComponent, {
  ComponentMeta,
} from '@plasmicapp/host/registerComponent'
import { Registerable } from './registerable'
import React from 'react'
import useCheckout from './checkout/use-checkout'
import { DataProvider } from '@plasmicapp/host'

export const checkoutMeta: ComponentMeta<React.PropsWithChildren<object>> = {
  name: 'plasmic-commerce-spree-checkout',
  displayName: 'Checkout',
  description:
    'Shows the checkout order page with the cart items and total price.',
  props: {},
  importPath: 'commerce-spree',
  importName: 'CheckoutComponent',
}

export function CheckoutComponent(props: React.PropsWithChildren<object>) {
  const { data } = useCheckout()
  return (
    <DataProvider data={data} name="checkout">
      {props.children}
    </DataProvider>
  )
}

export function registerCheckout(
  loader?: Registerable,
  customCheckoutMeta?: ComponentMeta<React.PropsWithChildren<object>>
) {
  const doRegisterComponent: typeof registerComponent = (...args) =>
    loader ? loader.registerComponent(...args) : registerComponent(...args)
  doRegisterComponent(CheckoutComponent, customCheckoutMeta ?? checkoutMeta)
}
