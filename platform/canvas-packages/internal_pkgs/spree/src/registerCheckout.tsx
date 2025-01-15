import registerComponent, {
  ComponentMeta,
} from '@plasmicapp/host/registerComponent'
import { Registerable } from './registerable'
import React from 'react'

interface CheckoutProps {
  className?: string
}

export const checkoutMeta: ComponentMeta<CheckoutProps> = {
  name: 'plasmic-commerce-spree-checkout',
  displayName: 'Checkout',
  description:
    'Shows the checkout order page with the cart items and total price.',
  props: {},
  importPath: 'commerce-spree',
  importName: 'CheckoutComponent',
}

export function CheckoutComponent(props: CheckoutProps) {
  const { className } = props

  return <span className={className}>Checkout Order</span>
}

export function registerCheckout(
  loader?: Registerable,
  customCheckoutMeta?: ComponentMeta<CheckoutProps>
) {
  const doRegisterComponent: typeof registerComponent = (...args) =>
    loader ? loader.registerComponent(...args) : registerComponent(...args)
  doRegisterComponent(CheckoutComponent, customCheckoutMeta ?? checkoutMeta)
}
