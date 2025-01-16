import { Registerable } from './registerable'
import { registerCommerceProvider } from './registerCommerceProvider'
import { registerCheckoutProvider } from './registerCheckoutProvider'
export * from './registerable'
export * from './registerCheckoutProvider'
export * from './registerCommerceProvider'

export * from './spree'

export function registerAll(loader?: Registerable) {
  registerCommerceProvider(loader)
  registerCheckoutProvider(loader)
}
