import { type SpreeSdkResponse } from "../../types";
import { TaxonAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Taxon'

const normalizeTaxon = (spreeSuccessResponse: SpreeSdkResponse, taxon: TaxonAttr) => {
  return {
    id: taxon.id,
    ...taxon.attributes,
  }
}

export default normalizeTaxon