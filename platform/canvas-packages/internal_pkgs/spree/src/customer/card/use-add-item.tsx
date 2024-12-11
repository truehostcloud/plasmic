import useAddItem from '@plasmicpkgs/commerce'
import type { UseAddItem } from '@plasmicpkgs/commerce'
import type { MutationHook } from '@plasmicpkgs/commerce'

export default useAddItem as UseAddItem<typeof handler>

export const handler: MutationHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    // TODO: Revise url and query
    url: 'checkout',
    query: 'addPayment',
  },
  async fetcher({ input, options, fetch }) {},
  useHook:
    ({ fetch }) =>
    () =>
    async () => ({}),
}
