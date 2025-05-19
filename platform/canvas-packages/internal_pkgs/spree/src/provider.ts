import fetcher from './fetcher'
import { handler as useCart } from './cart/use-cart'
import { handler as useAddItem } from './cart/use-add-item'
import { handler as useUpdateItem } from './cart/use-update-item'
import { handler as useRemoveItem } from './cart/use-remove-item'
import { handler as useSearch } from './product/use-search'
import { handler as useProduct } from './product/use-product'
import { handler as useCategories } from './site/use-categories'
import { handler as useBrands } from './site/use-brands'
import { handler as useCheckout } from './checkout/use-checkout'
import { handler as useSubmitCheckout } from './checkout/use-submit-checkout'
import { requireConfigValue } from './isomorphic-config'
import type { Fetcher, FetcherOptions } from '@plasmicpkgs/commerce'

export const getSpreeProvider = (apiHost: string) => {
  return {
    locale: requireConfigValue('defaultLocale') as string,
    cartCookie: requireConfigValue('cartCookieName') as string,
    fetcher: (requestOptions: FetcherOptions<any>) =>
      fetcher(apiHost, requestOptions),
    cart: { useCart, useAddItem, useUpdateItem, useRemoveItem },
    products: { useSearch, useProduct },
    site: { useCategories, useBrands },
    checkout: { useCheckout, useSubmitCheckout },
  }
}

export type SpreeProvider = {
  locale: string
  cartCookie: string
  fetcher: Fetcher
  cart: {
    useCart: typeof useCart
    useAddItem: typeof useAddItem
    useUpdateItem: typeof useUpdateItem
    useRemoveItem: typeof useRemoveItem
  }
  products: { useSearch: typeof useSearch; useProduct: typeof useProduct }
  site: { useCategories: typeof useCategories; useBrands: typeof useBrands }
  checkout: {
    useCheckout: typeof useCheckout
    useSubmitCheckout: typeof useSubmitCheckout
  }
}
