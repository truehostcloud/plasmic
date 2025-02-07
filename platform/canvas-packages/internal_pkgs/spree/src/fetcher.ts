import { FetcherOptions } from "@plasmicpkgs/commerce";
import convertSpreeErrorToGraphQlError from './utils/convert-spree-error-to-graph-ql-error'
import { makeClient, errors } from '@spree/storefront-api-v2-sdk'
import type { ResultResponse } from '@spree/storefront-api-v2-sdk/types/interfaces/ResultResponse'
import getSpreeSdkMethodFromEndpointPath from './utils/get-spree-sdk-method-from-endpoint-path'
import SpreeSdkMethodFromEndpointPathError from './errors/SpreeSdkMethodFromEndpointPathError'
import type {
  FetcherVariables,
  SpreeSdkResponse,
  SpreeSdkResponseWithRawResponse,
} from './types'
import createCustomizedFetchFetcher, {
  fetchResponseKey,
} from './utils/create-customized-fetch-fetcher'
import ensureFreshUserAccessToken from './utils/tokens/ensure-fresh-user-access-token'
import RefreshTokenError from './errors/RefreshTokenError'
import type { GraphQLFetcherResult } from './types'

type Fetcher<T = any, B = any> = (
  apiHost: string,
  options: FetcherOptions<B>
) => T | Promise<T>

const client = (apiHost: string) => makeClient({
  host: apiHost,
  createFetcher: (fetcherOptions) => {
    return createCustomizedFetchFetcher({
      fetch: globalThis.fetch,
      requestConstructor: globalThis.Request,
      ...fetcherOptions,
    })
  },
})

const normalizeSpreeSuccessResponse = (
  storeResponse: ResultResponse<SpreeSdkResponseWithRawResponse>
): GraphQLFetcherResult<SpreeSdkResponse> => {
  const data = storeResponse.success()
  const rawFetchResponse = data[fetchResponseKey]

  return {
    data,
    res: rawFetchResponse,
  }
}

const fetcher: Fetcher<GraphQLFetcherResult<SpreeSdkResponse>> = async (
  apiHost, requestOptions
) => {
  const { url, variables } = requestOptions

  console.log(
    'Fetcher called. Configuration: ',
    'url = ',
    url,
    'requestOptions = ',
    requestOptions
  )

  if (!variables) {
    throw new SpreeSdkMethodFromEndpointPathError(
      `Required FetcherVariables not provided.`
    )
  }

  const {
    methodPath,
    arguments: args,
    refreshExpiredAccessToken = true,
    replayUnauthorizedRequest = true,
  } = variables as FetcherVariables

  if (refreshExpiredAccessToken) {
    await ensureFreshUserAccessToken(client(apiHost))
  }

  const spreeSdkMethod = getSpreeSdkMethodFromEndpointPath(client(apiHost), methodPath)

  const storeResponse: ResultResponse<SpreeSdkResponseWithRawResponse> =
    await spreeSdkMethod(...args)

  if (storeResponse.isSuccess()) {
    return normalizeSpreeSuccessResponse(storeResponse)
  }

  const storeResponseError = storeResponse.fail()

  if (
    storeResponseError instanceof errors.SpreeError &&
    storeResponseError.serverResponse.status === 401 &&
    replayUnauthorizedRequest
  ) {
    console.info(
      'Request ended with 401. Replaying request after refreshing the user token.'
    )

    await ensureFreshUserAccessToken(client(apiHost))

    const replayedStoreResponse: ResultResponse<SpreeSdkResponseWithRawResponse> =
      await spreeSdkMethod(...args)

    if (replayedStoreResponse.isSuccess()) {
      return normalizeSpreeSuccessResponse(replayedStoreResponse)
    }

    console.warn('Replaying the request failed', replayedStoreResponse.fail())

    throw new RefreshTokenError(
      'Could not authorize request with current access token.'
    )
  }

  if (storeResponseError instanceof errors.SpreeError) {
    throw convertSpreeErrorToGraphQlError(storeResponseError)
  }

  throw storeResponseError
}

export default fetcher
