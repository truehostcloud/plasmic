import { SWRHook } from "@plasmicpkgs/commerce";
import { UseBrands, useBrands } from "@plasmicpkgs/commerce";
import { useMemo } from "react";
import { GetBrandsHook } from "../types/site";

export default useBrands as UseBrands<typeof handler>;

export const handler: SWRHook<GetBrandsHook> = {
  fetchOptions: {
    query: "use-brands",
  },
  async fetcher() {
    return []; // brands it's not available on saleor
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      });
      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.length ?? 0) <= 0;
              },
              enumerable: true,
            },
          }),
        [response]
      );
    },
};
