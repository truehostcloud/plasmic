import { Registerable } from './registerable'
import {
  registerCommerceProvider,
  CommerceProviderComponent,
} from './registerCommerceProvider'
import { registerCheckout } from './registerCheckout'
export * from './registerable'

export * from './spree'

export function registerAll(loader?: Registerable) {
  registerCommerceProvider(loader)
  registerCheckout(loader)
}

export { registerCommerceProvider, CommerceProviderComponent }
