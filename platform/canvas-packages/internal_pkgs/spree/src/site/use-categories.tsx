import type { SWRHook } from '@plasmicpkgs/commerce'
import { UseSearch, useSearch } from '@plasmicpkgs/commerce'
import type { SearchProductsHook } from '../types/product'
import type { GraphQLFetcherResult } from '../types'
import { ITaxons } from '@spree/storefront-api-v2-sdk/types/interfaces/Taxon'
import { requireConfigValue } from '../isomorphic-config'
import normalizeTaxon from '../utils/normalizations/normalize-taxon'

const imagesSize = requireConfigValue('imagesSize') as string
const imagesQuality = requireConfigValue('imagesQuality') as number

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

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<ITaxons>
    >({
      variables: {
        methodPath: 'taxons.list',
        arguments: [
          {
            include: 'image',
            per_page: 50,
            image_transformation: {
              quality: imagesQuality,
              size: imagesSize,
            },
          },
        ],
      },
    })

    return spreeSuccessResponse.data.map((taxon) => {
      return normalizeTaxon(spreeSuccessResponse, taxon)
    })
  },
  useHook: ({ useData }) => {
    const useWrappedHook: ReturnType<SWRHook<SearchProductsHook>['useHook']> = (
      input = {}
    ) => {
      return useData({
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
