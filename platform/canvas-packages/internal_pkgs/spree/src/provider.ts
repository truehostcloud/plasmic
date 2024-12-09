import fetcher from './fetcher'
import { handler as useCart } from './cart/use-cart'
import { handler as useAddItem } from './cart/use-add-item'
import { handler as useUpdateItem } from './cart/use-update-item'
import { handler as useRemoveItem } from './cart/use-remove-item'
import { handler as useCustomer } from './customer/use-customer'
import { handler as useSearch } from './product/use-search'
import { handler as useCheckout } from './checkout/use-checkout'
import { handler as useWishlist } from './wishlist/use-wishlist'
import { handler as useWishlistAddItem } from './wishlist/use-add-item'
import { handler as useWishlistRemoveItem } from './wishlist/use-remove-item'
import { requireConfigValue } from './isomorphic-config'
import { Fetcher as BaseFetcher } from '@plasmicpkgs/commerce'

export const getSpreeProvider = (apiHost: string) => (
  {
    locale: requireConfigValue('defaultLocale') as string,
    cartCookie: requireConfigValue('cartCookieName') as string,
    fetcher: (requestOptions: object) => fetcher(apiHost, requestOptions),
    cart: { useCart, useAddItem, useUpdateItem, useRemoveItem },
    customer: { useCustomer },
    products: { useSearch },
    checkout: { useCheckout },
    wishlist: {
      useWishlist,
      useAddItem: useWishlistAddItem,
      useRemoveItem: useWishlistRemoveItem,
    },
  }
)

export type SpreeProvider = {
  locale: string,
  cartCookie: string,
  fetcher: BaseFetcher,
  cart: {
    useCart: typeof useCart;
    useAddItem: typeof useAddItem;
    useUpdateItem: typeof useUpdateItem;
    useRemoveItem: typeof useRemoveItem
  };
  customer: { useCustomer: typeof useCustomer},
  products: { useSearch: typeof useSearch},
  checkout: { useCheckout: typeof useCheckout},
  wishlist: {
    useWishlist: typeof useWishlist,
    useAddItem: typeof useWishlistAddItem,
    useRemoveItem: typeof useWishlistRemoveItem,
  },
}