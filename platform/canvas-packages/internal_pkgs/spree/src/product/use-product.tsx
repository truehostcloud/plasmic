import type { SWRHook } from '@plasmicpkgs/commerce'
import { UseProduct, useProduct, GetProductHook } from '@plasmicpkgs/commerce'
import normalizeProduct from '../utils/normalizations/normalize-product'
import type { GraphQLFetcherResult } from '../types'
import {
  IProducts as BaseIProducts,
  ProductAttr,
} from '@spree/storefront-api-v2-sdk/types/interfaces/Product'
import { requireConfigValue } from '../isomorphic-config'

export interface IProducts extends BaseIProducts {
  data: ProductAttr[]
  links: {
    self: string
    first: string
    last: string
    next: string
    prev: string
  }
}

const imagesSize = requireConfigValue('imagesSize') as string
const imagesQuality = requireConfigValue('imagesQuality') as number

export const handler: SWRHook<any> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'products',
    query: 'list',
  },
  async fetcher({ input, options, fetch }) {
    // This method is only needed if the options need to be modified before calling the generic fetcher (created in createFetcher).

    console.info(
      'useProduct fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options,
      'fetch: ',
      fetch
    )

    const { data: spreeSuccessResponse } = await fetch<
      GraphQLFetcherResult<IProducts>
    >({
      variables: {
        methodPath: 'products.list',
        arguments: [
          {},
          {
            filter: {
              'filter[ids]': input.id,
            },
            include:
              'primary_variant,variants,images,option_types,variants.option_values',
            image_transformation: {
              quality: imagesQuality,
              size: imagesSize,
            },
          },
        ],
      },
    })

    const baseUrl = new URL(spreeSuccessResponse.links.self).origin

    return spreeSuccessResponse.data[0]
      ? normalizeProduct(
          spreeSuccessResponse,
          spreeSuccessResponse.data[0],
          baseUrl
        )
      : null
  },
  useHook: ({ useData }) => {
    const useWrappedHook: ReturnType<SWRHook<GetProductHook>['useHook']> = (
      input = {}
    ) => {
      return useData({
        input: [['id', input.id]],
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

export default useProduct as unknown as UseProduct<typeof handler>
