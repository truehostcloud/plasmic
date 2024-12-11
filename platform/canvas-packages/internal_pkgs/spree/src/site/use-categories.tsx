import { SWRHook } from "@plasmicpkgs/commerce";
import { UseCategories, useCategories } from "@plasmicpkgs/commerce";
import { useMemo } from "react";
import { GetCategoriesHook } from "../types/site";

export default useCategories as UseCategories<typeof handler>;

export const handler: SWRHook<GetCategoriesHook> = {
  fetchOptions: {
    query: "use-categories",
  },
  async fetcher({ fetch }) {
    const data: any = await fetch({
      query: "use-categories",
    });
    return data?.collection ? [data?.collection] : [];
  },
  useHook:
    ({ useData }) =>
      (input) => {
        const response = useData({
          input: [["categoryId", input?.categoryId]],
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