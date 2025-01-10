import { Image } from './common'

export interface Taxon {
  id: string
  name: string
  permalink: string
  pretty_name: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  seo_title: string | null
  image: Image | null
  children: Taxon[]
  is_root: boolean
  is_child: boolean
}