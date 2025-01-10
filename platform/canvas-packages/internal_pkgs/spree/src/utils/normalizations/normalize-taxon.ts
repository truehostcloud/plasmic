import type { SpreeSdkResponse } from '../../types'
import { TaxonAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Taxon'
import { jsonApi } from '@spree/storefront-api-v2-sdk'
import { Taxon } from '../../types/taxon'
import getMediaGallery from '../get-media-gallery'
import createGetAbsoluteImageUrl from '../create-get-absolute-image-url'

const normalizeTaxon = (
  spreeSuccessResponse: SpreeSdkResponse,
  taxon: TaxonAttr,
  baseUrl: string
): Taxon => {
  const spreeTaxonImages = taxon.relationships.image.data
    ? jsonApi.findRelationshipDocuments(spreeSuccessResponse, taxon, 'image')
    : null
  const spreeTaxonChildren = jsonApi.findRelationshipDocuments(
    spreeSuccessResponse,
    taxon,
    'children'
  )
  const productImages = getMediaGallery(
    spreeTaxonImages,
    createGetAbsoluteImageUrl(baseUrl as string)
  )
  console.log('spreeTaxonImage', spreeTaxonImages)
  console.log('spreeTaxonChildren', spreeTaxonChildren)

  return {
    id: taxon.id,
    ...taxon.attributes,
    image: null,
    children: null,
  }
}

export default normalizeTaxon
