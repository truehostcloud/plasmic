import { useHook, useMutationHook } from '@plasmicpkgs/commerce/utils/use-hook'
import { mutationFetcher } from '@plasmicpkgs/commerce/utils/default-fetcher'
import type { MutationHook, HookFetcherFn } from '@plasmicpkgs/commerce/utils/types'
import type { LoginHook } from '@plasmicpkgs/commerce/types/login'
import type { Provider } from '..'

export type UseLogin<
  H extends MutationHook<LoginHook> = MutationHook<LoginHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<LoginHook> = mutationFetcher

const fn = (provider: Provider) => provider.auth?.useLogin!

const useLogin: UseLogin = (...args) => {
  const hook = useHook(fn)
  return useMutationHook({ fetcher, ...hook })(...args)
}

export default useLogin
