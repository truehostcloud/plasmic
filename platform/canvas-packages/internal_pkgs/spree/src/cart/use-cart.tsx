import { useMemo } from 'react'
import type { SWRHook } from '@plasmicpkgs/commerce'
import { useCart as useCommerceCart, UseCart } from '@plasmicpkgs/commerce'
import type { GetCartHook } from '../types/cart'
import normalizeCart from '../utils/normalizations/normalize-cart'
import getCart from '../utils/get-cart'

export default useCommerceCart as UseCart<typeof handler>

// This handler avoids calling /api/cart.
// There doesn't seem to be a good reason to call it.
// So far, only bigcommerce uses it.
export const handler: SWRHook<GetCartHook> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'cart',
    query: 'show',
  },
  async fetcher({ input, options, fetch }) {
    console.info(
      'useCart fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )

    const spreeCartResponse = await getCart(fetch)

    return normalizeCart(spreeCartResponse, spreeCartResponse.data)
  },
  useHook: ({ useData }) => {
    const useWrappedHook: ReturnType<SWRHook<GetCartHook>['useHook']> = (
      input
    ) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })

      return useMemo<typeof response & { isEmpty: boolean }>(() => {
        return Object.create(response, {
          isEmpty: {
            get() {
              return (response.data?.lineItems.length ?? 0) === 0
            },
            enumerable: true,
          },
        })
      }, [response])
    }

    return useWrappedHook
  },
}
