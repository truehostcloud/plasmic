import { Registerable } from './registerable'
import { registerCommerceProvider } from './registerCommerceProvider'
import { registerCheckout } from './registerCheckout'
export * from './registerable'
export * from './registerCheckout'
export * from './registerCommerceProvider'

export * from './spree'

export function registerAll(loader?: Registerable) {
  registerCommerceProvider(loader)
  registerCheckout(loader)
}
