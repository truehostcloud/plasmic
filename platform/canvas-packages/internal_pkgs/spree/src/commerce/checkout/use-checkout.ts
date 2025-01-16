import type { SWRHook, HookFetcherFn } from '@plasmicpkgs/commerce'
import type { GetCheckoutHook } from '../types/checkout'

import Cookies from 'js-cookie'

import { useHook, useSWRHook } from '../utils/use-hook'
import { useCommerce } from '..'
import { Provider } from '@plasmicpkgs/commerce'

export type UseCheckout<
  H extends SWRHook<GetCheckoutHook> = SWRHook<GetCheckoutHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<GetCheckoutHook> = async ({
  options,
  input: { cartId },
  fetch,
}) => {
  return cartId ? await fetch(options) : null
}

const fn = (provider: Provider) => {
  return provider.checkout?.useCheckout!
}

const useCheckout: UseCheckout = (input) => {
  const hook = useHook(fn)
  const { cartCookie } = useCommerce()
  const fetcherFn = hook.fetcher ?? fetcher
  const wrapper: typeof fetcher = (context) => {
    context.input.cartId = Cookies.get(cartCookie)
    return fetcherFn(context)
  }
  return useSWRHook({ ...hook, fetcher: wrapper })(input)
}

export default useCheckout
