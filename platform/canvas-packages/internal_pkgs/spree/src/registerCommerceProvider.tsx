import { GlobalContextMeta } from '@plasmicapp/host'
import registerGlobalContext from '@plasmicapp/host/registerGlobalContext'
import { CartActionsProvider } from '@plasmicpkgs/commerce'
import React from 'react'
import { Registerable } from './registerable'
import { getCommerceProvider } from './spree'
import {
  CheckoutActionsProvider,
  globalActionsRegistrations,
} from './registerCheckoutProvider'

interface CommerceProviderProps {
  children?: React.ReactNode
  apiHost: string
}

const globalContextName = 'plasmic-commerce-spree-provider'

export const commerceProviderMeta: GlobalContextMeta<CommerceProviderProps> = {
  name: globalContextName,
  displayName: 'Spree Provider',
  props: {
    apiHost: {
      type: 'string',
      defaultValue: 'https://olitt.shop',
    },
  },
  ...{ globalActions: globalActionsRegistrations },
  importPath: 'commerce-spree',
  importName: 'CommerceProviderComponent',
}

export function CommerceProviderComponent(props: CommerceProviderProps) {
  const { apiHost, children } = props

  const CommerceProvider = React.useMemo(
    () => getCommerceProvider(apiHost),
    [apiHost]
  )

  return (
    <CommerceProvider>
      <CartActionsProvider globalContextName={globalContextName}>
        <CheckoutActionsProvider globalContextName={globalContextName}>
          {children}
        </CheckoutActionsProvider>
      </CartActionsProvider>
    </CommerceProvider>
  )
}

export function registerCommerceProvider(
  loader?: Registerable,
  customCommerceProviderMeta?: GlobalContextMeta<CommerceProviderProps>
) {
  const doRegisterComponent: typeof registerGlobalContext = (...args) =>
    loader
      ? loader.registerGlobalContext(...args)
      : registerGlobalContext(...args)
  doRegisterComponent(
    CommerceProviderComponent,
    customCommerceProviderMeta ?? commerceProviderMeta
  )
}
