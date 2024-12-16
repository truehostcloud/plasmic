import forceIsomorphicConfigValues from './utils/force-isomorphic-config-values'
import requireConfig from './utils/require-config'
import validateAllProductsTaxonomyId from './utils/validations/validate-all-products-taxonomy-id'
import validateCookieExpire from './utils/validations/validate-cookie-expire'
import validateImagesOptionFilter from './utils/validations/validate-images-option-filter'
import validatePlaceholderImageUrl from './utils/validations/validate-placeholder-image-url'
import validateProductsPrerenderCount from './utils/validations/validate-products-prerender-count'
import validateImagesSize from './utils/validations/validate-images-size'
import validateImagesQuality from './utils/validations/validate-images-quality'

const isomorphicConfig = {
  defaultLocale: process.env.NEXT_PUBLIC_SPREE_DEFAULT_LOCALE ?? 'en-us',
  cartCookieName: process.env.NEXT_PUBLIC_SPREE_CART_COOKIE_NAME ?? 'spree_cart_token',
  cartCookieExpire: validateCookieExpire(
    process.env.NEXT_PUBLIC_SPREE_CART_COOKIE_EXPIRE ?? 7
  ),
  userCookieName: process.env.NEXT_PUBLIC_SPREE_USER_COOKIE_NAME ?? 'spree_user_token',
  userCookieExpire: validateCookieExpire(
    process.env.NEXT_PUBLIC_SPREE_CART_COOKIE_EXPIRE ?? 7
  ),
  imageHost: process.env.NEXT_PUBLIC_SPREE_IMAGE_HOST,
  categoriesTaxonomyPermalink:
    process.env.NEXT_PUBLIC_SPREE_CATEGORIES_TAXONOMY_PERMALINK,
  brandsTaxonomyPermalink:
    process.env.NEXT_PUBLIC_SPREE_BRANDS_TAXONOMY_PERMALINK,
  allProductsTaxonomyId: validateAllProductsTaxonomyId(
    process.env.NEXT_PUBLIC_SPREE_ALL_PRODUCTS_TAXONOMY_ID ?? false
  ),
  showSingleVariantOptions:
    process.env.NEXT_PUBLIC_SPREE_SHOW_SINGLE_VARIANT_OPTIONS === 'true',
  lastUpdatedProductsPrerenderCount: validateProductsPrerenderCount(
    process.env.NEXT_PUBLIC_SPREE_LAST_UPDATED_PRODUCTS_PRERENDER_COUNT ?? 10
  ),
  productPlaceholderImageUrl: validatePlaceholderImageUrl(
    process.env.NEXT_PUBLIC_SPREE_PRODUCT_PLACEHOLDER_IMAGE_URL ?? '/product-img-placeholder.svg'
  ),
  lineItemPlaceholderImageUrl: validatePlaceholderImageUrl(
    process.env.NEXT_PUBLIC_SPREE_LINE_ITEM_PLACEHOLDER_IMAGE_URL ?? '/product-img-placeholder.svg'
  ),
  imagesOptionFilter: validateImagesOptionFilter(
    process.env.NEXT_PUBLIC_SPREE_IMAGES_OPTION_FILTER ?? false
  ),
  imagesSize: validateImagesSize(process.env.NEXT_PUBLIC_SPREE_IMAGES_SIZE ?? '1000x1000'),
  imagesQuality: validateImagesQuality(
    process.env.NEXT_PUBLIC_SPREE_IMAGES_QUALITY ?? 100
  ),
  loginAfterSignup: process.env.NEXT_PUBLIC_SPREE_LOGIN_AFTER_SIGNUP === 'true',
}

export default forceIsomorphicConfigValues(
  isomorphicConfig,
  [],
  [
    'apiHost',
    'defaultLocale',
    'cartCookieName',
    'cartCookieExpire',
    'userCookieName',
    'userCookieExpire',
    'imageHost',
    'categoriesTaxonomyPermalink',
    'brandsTaxonomyPermalink',
    'allProductsTaxonomyId',
    'showSingleVariantOptions',
    'lastUpdatedProductsPrerenderCount',
    'productPlaceholderImageUrl',
    'lineItemPlaceholderImageUrl',
    'imagesOptionFilter',
    'imagesSize',
    'imagesQuality',
    'loginAfterSignup',
  ]
)

type IsomorphicConfig = typeof isomorphicConfig

const requireConfigValue = (key: keyof IsomorphicConfig) =>
  requireConfig<IsomorphicConfig>(isomorphicConfig, key)

export { requireConfigValue }
