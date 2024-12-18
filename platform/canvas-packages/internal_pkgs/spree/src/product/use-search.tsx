import type { SWRHook } from '@plasmicpkgs/commerce'
import type {
  Product,
  SearchProductsHook,
} from '../types/product'
import { UseSearch, useSearch } from '@plasmicpkgs/commerce'
import normalizeProduct from '../utils/normalizations/normalize-product'
import type { GraphQLFetcherResult } from '../types'
import { IProducts as BaseIProducts, ProductAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Product'
import { requireConfigValue } from '../isomorphic-config'

export interface IProducts extends BaseIProducts {
  data: ProductAttr[],
  links: {
    self: string,
    first: string,
    last: string,
    next: string,
    prev: string
  }
}

const imagesSize = requireConfigValue('imagesSize') as string
const imagesQuality = requireConfigValue('imagesQuality') as number

const nextToSpreeSortMap: { [key: string]: string } = {
  'trending-desc': 'available_on',
  'latest-desc': 'updated_at',
  'price-asc': 'price',
  'price-desc': '-price',
}

export const handler: SWRHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'products',
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

    const taxons = [input.categoryId, input.brandId].filter(Boolean)

    const filter = {
      filter: {
        ...(taxons.length > 0 ? { taxons: taxons.join(',') } : {}),
        ...(input.search ? { name: input.search } : {}),
      },
    }

    const sort = input.sort ? { sort: nextToSpreeSortMap[input.sort] } : {}

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<IProducts>
    >({
      variables: {
        methodPath: 'products.list',
        arguments: [
          {},
          {
            include:
              'primary_variant,variants,images,option_types,variants.option_values',
            per_page: 50,
            ...filter,
            ...sort,
            image_transformation: {
              quality: imagesQuality,
              size: imagesSize,
            },
          },
        ],
      },
    })

    const baseUrl = new URL(spreeSuccessResponse.links.self).origin;

    const normalizedProducts: Product[] = spreeSuccessResponse.data.map(
      (spreeProduct) => normalizeProduct(spreeSuccessResponse, spreeProduct, baseUrl)
    )

    const found = spreeSuccessResponse.data.length > 0

    return { products: normalizedProducts, found }
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
