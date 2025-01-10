// Based on https://github.com/spark-solutions/spree2vuestorefront/blob/d88d85ae1bcd2ec99b13b81cd2e3c25600a0216e/src/utils/index.ts

import type { Image } from '../types/common'
import { SpreeProductImage, SpreeTaxonImage } from '../types'

const getMediaGallery = (
  images: SpreeProductImage[] | SpreeTaxonImage[],
  getImageUrl: (
    image: SpreeProductImage | SpreeTaxonImage,
    minWidth: number,
    minHeight: number
  ) => string | null
) => {
  return images.reduce<Image[]>((itemImages, _, imageIndex) => {
    const url = getImageUrl(images[imageIndex], 800, 800)

    if (url) {
      return [...itemImages, { url }]
    }

    return itemImages
  }, [])
}

export default getMediaGallery
