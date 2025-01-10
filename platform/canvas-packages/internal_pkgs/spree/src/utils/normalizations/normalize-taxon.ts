import type { SpreeSdkResponse } from '../../types'
import { TaxonAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Taxon'
import { jsonApi } from '@spree/storefront-api-v2-sdk'
import { Taxon } from '../../types/taxon'

const normalizeTaxon = (
  spreeSuccessResponse: SpreeSdkResponse,
  taxon: TaxonAttr
): Taxon => {
  const spreeTaxonImageReport = jsonApi.findRelationshipDocuments(
    spreeSuccessResponse,
    taxon,
    'image'
  )
  console.log('spreeTaxonImageReport', spreeTaxonImageReport)

  return {
    id: taxon.id,
    ...taxon.attributes,
    image: null,
    children: null,
  }
}

export default normalizeTaxon
