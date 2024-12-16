import { GlobalContextMeta } from "@plasmicapp/host";
import registerGlobalContext from "@plasmicapp/host/registerGlobalContext";
import {
  CartActionsProvider,
  globalActionsRegistrations,
} from "@plasmicpkgs/commerce";
import React from "react";
import { Registerable } from "./registerable";
import { getCommerceProvider } from "./spree";

interface CommerceProviderProps {
  children?: React.ReactNode;
  apiHost: string;
}

const globalContextName = "plasmic-commerce-spree-provider";

export const commerceProviderMeta: GlobalContextMeta<CommerceProviderProps> = {
  name: globalContextName,
  displayName: "Spree Provider",
  props: {
    apiHost: {
      type: "string",
      defaultValue: "https://olitt.shop",
    },
  },
  ...{ globalActions: globalActionsRegistrations },
  importPath: "commerce-spree",
  importName: "CommerceProviderComponent",
};

export function CommerceProviderComponent(props: CommerceProviderProps) {
  const { apiHost, children } = props;

  const CommerceProvider = React.useMemo(
    () => getCommerceProvider(apiHost),
    [apiHost]
  );

  return (
    <CommerceProvider>
      <CartActionsProvider globalContextName={globalContextName}>
        {children}
      </CartActionsProvider>
    </CommerceProvider>
  );
}

export function registerCommerceProvider(
  loader?: Registerable,
  customCommerceProviderMeta?: GlobalContextMeta<CommerceProviderProps>
) {
  const doRegisterComponent: typeof registerGlobalContext = (...args) =>
    loader
      ? loader.registerGlobalContext(...args)
      : registerGlobalContext(...args);
  doRegisterComponent(
    CommerceProviderComponent,
    customCommerceProviderMeta ?? commerceProviderMeta
  );
}
