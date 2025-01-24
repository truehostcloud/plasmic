import type { SubmitCheckoutHook } from '../commerce/types/checkout'
import type { MutationHook } from '../commerce/utils/types'

import { useCallback } from 'react'
import useSubmitCheckout, {
  UseSubmitCheckout,
} from '../commerce/checkout/use-submit-checkout'
import { ValidationError } from '@plasmicpkgs/commerce'
import submitCheckout from '../utils/submit-checkout'
import useCheckout from './use-checkout'

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
    > = () => {
      const { mutate } = useCheckout()

      return useCallback(
        async (input) => {
          const {
            email,
            special_instructions,
            billing_address,
            shipping_address,
            payments,
            shipments,
            onSuccessAction,
          } = input

          if (
            !email &&
            !special_instructions &&
            !billing_address &&
            !shipping_address &&
            !payments &&
            !shipments
          ) {
            throw new ValidationError({
              message:
                'email or special_instructions or billing_address or' +
                ' shipping_address or payments or shipments needs to be provided.',
            })
          }
          const data = await fetch({
            input: {
              email,
              special_instructions,
              billing_address,
              shipping_address,
              payments,
              shipments,
              onSuccessAction,
            },
          })

          await mutate(data, false)

          return data
        },
        [mutate]
      )
    }
    return useWrappedHook
  },
}
