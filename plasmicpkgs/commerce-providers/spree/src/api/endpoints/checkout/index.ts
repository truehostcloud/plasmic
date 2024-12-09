import { createEndpoint } from '@plasmicpkgs/commerce/api'
import type { GetAPISchema, CommerceAPI } from '@plasmicpkgs/commerce/api'
import checkoutEndpoint from '@plasmicpkgs/commerce/api/endpoints/checkout'
import type { CheckoutSchema } from '@plasmicpkgs/commerce/types/checkout'
import getCheckout from './get-checkout'
import type { SpreeApiProvider } from '../..'

export type CheckoutAPI = GetAPISchema<
  CommerceAPI<SpreeApiProvider>,
  CheckoutSchema
>

export type CheckoutEndpoint = CheckoutAPI['endpoint']

export const handlers: CheckoutEndpoint['handlers'] = { getCheckout }

const checkoutApi = createEndpoint<CheckoutAPI>({
  handler: checkoutEndpoint,
  handlers,
})

export default checkoutApi
