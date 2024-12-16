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
  defaultLocale: 'en-us',
  cartCookieName: 'spree_cart_token',
  cartCookieExpire: validateCookieExpire(7),
  userCookieName: 'spree_user_token',
  userCookieExpire: validateCookieExpire(7),
  imageHost: 'olitt.shop',
  categoriesTaxonomyPermalink: 'categories',
  brandsTaxonomyPermalink: 'brands',
  allProductsTaxonomyId: validateAllProductsTaxonomyId(false),
  showSingleVariantOptions: false,
  lastUpdatedProductsPrerenderCount: validateProductsPrerenderCount(10),
  productPlaceholderImageUrl: validatePlaceholderImageUrl(
    '/product-img-placeholder.svg'
  ),
  lineItemPlaceholderImageUrl: validatePlaceholderImageUrl(
    '/product-img-placeholder.svg'
  ),
  imagesOptionFilter: validateImagesOptionFilter(false),
  imagesSize: validateImagesSize('1000x1000'),
  imagesQuality: validateImagesQuality(100),
  loginAfterSignup: true,
}

export default forceIsomorphicConfigValues(
  isomorphicConfig,
  [],
  [
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
