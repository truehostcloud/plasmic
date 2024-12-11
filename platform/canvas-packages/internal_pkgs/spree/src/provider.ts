import fetcher from './fetcher'
import { handler as useCart } from './cart/use-cart'
import { handler as useAddItem } from './cart/use-add-item'
import { handler as useUpdateItem } from './cart/use-update-item'
import { handler as useRemoveItem } from './cart/use-remove-item'
import { handler as useSearch } from './product/use-search'
import { requireConfigValue } from './isomorphic-config'
import type { Fetcher } from '@plasmicpkgs/commerce'

export const getSpreeProvider = (apiHost: string) => (
  {
    locale: requireConfigValue('defaultLocale') as string,
    cartCookie: requireConfigValue('cartCookieName') as string,
    fetcher: (requestOptions: object) => fetcher(apiHost, requestOptions),
    cart: { useCart, useAddItem, useUpdateItem, useRemoveItem },
    products: { useSearch },
  }
)

export type SpreeProvider = {
  locale: string,
  cartCookie: string,
  fetcher: Fetcher,
  cart: {
    useCart: typeof useCart;
    useAddItem: typeof useAddItem;
    useUpdateItem: typeof useUpdateItem;
    useRemoveItem: typeof useRemoveItem
  };
  products: { useSearch: typeof useSearch},
}