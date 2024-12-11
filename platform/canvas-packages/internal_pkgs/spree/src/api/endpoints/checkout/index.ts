import { createEndpoint } from '@plasmicpkgs/commerce'
import type { GetAPISchema, CommerceAPI } from '@plasmicpkgs/commerce'
import checkoutEndpoint from '@plasmicpkgs/commerce'
import type { CheckoutSchema } from '@plasmicpkgs/commerce'
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
