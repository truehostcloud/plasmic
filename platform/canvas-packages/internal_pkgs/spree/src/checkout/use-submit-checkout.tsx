import type { SubmitCheckoutHook } from '../commerce/types/checkout'
import type { MutationHook } from '../commerce/utils/types'

import { useMemo } from 'react'
import useSubmitCheckout, {
  UseSubmitCheckout,
} from '../commerce/checkout/use-submit-checkout'
import { ValidationError } from '@plasmicpkgs/commerce'
import debounce from 'lodash.debounce'
import submitCheckout from '../utils/submit-checkout'

export default useSubmitCheckout as UseSubmitCheckout<typeof handler>

export const handler: MutationHook<SubmitCheckoutHook> = {
  // Provide fetchOptions for SWR cache key
  fetchOptions: {
    url: 'checkout',
    query: 'orderUpdate',
  },
  async fetcher({ input, options, fetch }) {
    console.info(
      'useSubmitCheckout fetcher called. Configuration: ',
      'input: ',
      input,
      'options: ',
      options
    )
    return await submitCheckout(fetch, input)
  },
  useHook: ({ fetch }) => {
    const useWrappedHook: ReturnType<
      MutationHook<SubmitCheckoutHook>['useHook']
    > = (context) => {
      return useMemo(
        () =>
          debounce(async (input: SubmitCheckoutHook['actionInput']) => {
            const {
              email,
              special_instructions,
              billing_address,
              shipping_address,
              payments,
            } = input

            if (
              !email &&
              !special_instructions &&
              !billing_address &&
              !shipping_address &&
              !payments
            ) {
              throw new ValidationError({
                message:
                  'email or special_instructions or billing_address or shipping_address or payments needs to be provided.',
              })
            }

            const data = await fetch({
              input: {
                email,
                special_instructions,
                billing_address,
                shipping_address,
                payments,
              },
            })
            return data
          }),
        [context]
      )
    }

    return useWrappedHook
  },
}
