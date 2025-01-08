import type { SWRHook } from '@plasmicpkgs/commerce'
import { UseSearch, useSearch } from '@plasmicpkgs/commerce'
import type { SearchProductsHook } from '../types/product'
import type { GraphQLFetcherResult } from '../types'
import { ITaxons } from '@spree/storefront-api-v2-sdk/types/interfaces/Taxon'

const nextToSpreeSortMap: { [key: string]: string } = {
  'trending-desc': 'available_on',
  'latest-desc': 'updated_at',
  'price-asc': 'price',
  'price-desc': '-price',
}

export const handler: SWRHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'taxons',
    query: 'list',
  },
  async fetcher({ input, options, fetch }) {
    // This method is only needed if the options need to be modified before calling the generic fetcher (created in createFetcher).

    console.info(
      'useSearch fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options,
      'fetch: ',
      fetch
    )

    const sort = input.sort ? { sort: nextToSpreeSortMap[input.sort] } : {}

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<ITaxons>
    >({
      variables: {
        methodPath: 'taxons.list',
        arguments: [],
      },
    })

    return spreeSuccessResponse.data.map((category) => {
      return {
        id: category.id,
        ...category.attributes,
      }
    })
  },
  useHook: ({ useData }) => {
    const useWrappedHook: ReturnType<SWRHook<SearchProductsHook>['useHook']> = (
      input = {}
    ) => {
      return useData({
        input: [
          ['search', input.search],
          ['categoryId', input.categoryId],
          ['brandId', input.brandId],
          ['sort', input.sort],
        ],
        swrOptions: {
          revalidateOnFocus: false,
          // revalidateOnFocus: false means do not fetch products again when website is refocused in the web browser.
          ...input.swrOptions,
        },
      })
    }

    return useWrappedHook
  },
}

export default useSearch as unknown as UseSearch<typeof handler>
