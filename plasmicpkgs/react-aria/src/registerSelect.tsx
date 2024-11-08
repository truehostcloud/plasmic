import React, { useEffect, useMemo } from "react";
import {
  Select,
  SelectProps,
  SelectStateContext,
  SelectValue,
} from "react-aria-components";
import { getCommonProps } from "./common";
import { PlasmicListBoxContext, PlasmicPopoverContext } from "./contexts";
import { ListBoxItemIdManager } from "./ListBoxItemIdManager";
import { BUTTON_COMPONENT_NAME } from "./registerButton";
import { LABEL_COMPONENT_NAME } from "./registerLabel";
import { LIST_BOX_COMPONENT_NAME } from "./registerListBox";
import { POPOVER_COMPONENT_NAME } from "./registerPopover";
import {
  extractPlasmicDataProps,
  HasControlContextData,
  makeComponentName,
  Registerable,
  registerComponentHelper,
  useAutoOpen,
} from "./utils";

// It cannot be used as a hook like useAutoOpen() within the BaseSelect component
// because it needs access to SelectStateContext, which is only created in the BaseSelect component's render function.
function SelectAutoOpen(props: any) {
  const { open, close } = React.useContext(SelectStateContext) ?? {};
  useAutoOpen({ props, open, close });

  return null;
}

export interface BaseSelectValueProps
  extends React.ComponentProps<typeof SelectValue> {
  customize?: boolean;
}

export const BaseSelectValue = (props: BaseSelectValueProps) => {
  const { children, customize, className } = props;
  const placeholder = customize ? children : "Select an item";
  return (
    <SelectValue className={className}>
      {({ isPlaceholder, selectedText }) => (
        <>{isPlaceholder ? placeholder : selectedText}</>
      )}
    </SelectValue>
  );
};

const SELECT_NAME = makeComponentName("select");

export interface BaseSelectControlContextData {
  itemIds: string[];
}

export interface BaseSelectProps
  extends SelectProps<{}>, // NOTE: We don't need generic type here since we don't use items prop (that needs it). We just need to make the type checker happy
    HasControlContextData<BaseSelectControlContextData> {
  children?: React.ReactNode;
}

export function BaseSelect(props: BaseSelectProps) {
  const {
    selectedKey,
    onSelectionChange,
    placeholder,
    onOpenChange,
    isDisabled,
    className,
    style,
    children,
    disabledKeys,
    name,
    setControlContextData,
    "aria-label": ariaLabel,
  } = props;

  let idManager = useMemo(() => new ListBoxItemIdManager(), []);

  useEffect(() => {
    idManager.subscribe((ids: string[]) => {
      setControlContextData?.({
        itemIds: ids,
      });
    });
  }, []);

  return (
    <Select
      placeholder={placeholder}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      onOpenChange={onOpenChange}
      isDisabled={isDisabled}
      className={className}
      style={style}
      name={name}
      disabledKeys={disabledKeys}
      aria-label={ariaLabel}
      {...extractPlasmicDataProps(props)}
    >
      <SelectAutoOpen {...props} />
      <PlasmicPopoverContext.Provider value={{}}>
        <PlasmicListBoxContext.Provider
          value={{
            idManager,
          }}
        >
          {children}
        </PlasmicListBoxContext.Provider>
      </PlasmicPopoverContext.Provider>
    </Select>
  );
}

export function registerSelect(loader?: Registerable) {
  const selectValueMeta = registerComponentHelper(loader, BaseSelectValue, {
    name: makeComponentName("select-value"),
    displayName: "Aria Selected Value",
    importPath: "@plasmicpkgs/react-aria/skinny/registerSelect",
    importName: "BaseSelectValue",
    parentComponentName: SELECT_NAME,
    props: {
      customize: {
        type: "boolean",
        description: "Whether to customize the selected value display",
      },
      children: {
        type: "slot",
        defaultValue: [
          {
            type: "text",
            value: "Selected value...",
          },
        ],
        hidden: (props) => !props.customize,
      },
    },
    trapsFocus: true,
  });

  registerComponentHelper(loader, BaseSelect, {
    name: SELECT_NAME,
    displayName: "Aria Select",
    importPath: "@plasmicpkgs/react-aria/skinny/registerSelect",
    importName: "BaseSelect",
    props: {
      ...getCommonProps<BaseSelectProps>("Select", [
        "name",
        "aria-label",
        "placeholder",
        "isDisabled",
        "autoFocus",
      ]),
      selectedKey: {
        type: "choice",
        editOnly: true,
        uncontrolledProp: "defaultSelectedKey",
        displayName: "Initial selected item",
        options: (_props, ctx) => (ctx?.itemIds ? Array.from(ctx.itemIds) : []),
        // React Aria Select do not support multiple selections yet
        multiSelect: false,
      },
      onSelectionChange: {
        type: "eventHandler",
        argTypes: [{ name: "selectedValue", type: "string" }],
      },
      disabledKeys: {
        type: "choice",
        displayName: "Disabled values",
        description:
          "The items that are disabled. These items cannot be selected, focused, or otherwise interacted with.",
        options: (_props, ctx) => (ctx?.itemIds ? Array.from(ctx.itemIds) : []),
        multiSelect: true,
        advanced: true,
      },
      isOpen: {
        type: "boolean",
        defaultValue: false,
        // It doesn't make sense to make isOpen prop editable (it's controlled by user interaction and always closed by default), so we keep this prop hidden. We have listed the prop here in the meta only so we can expose a writeable state for it.
        hidden: () => true,
      },
      onOpenChange: {
        type: "eventHandler",
        argTypes: [{ name: "isOpen", type: "boolean" }],
      },
      children: {
        type: "slot",
        mergeWithParent: true,
        defaultValue: [
          {
            type: "vbox",
            styles: {
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "300px",
              padding: 0,
            },
            children: [
              {
                type: "component",
                name: LABEL_COMPONENT_NAME,
                props: {
                  children: {
                    type: "text",
                    value: "Label",
                  },
                },
              },
              {
                type: "component",
                name: BUTTON_COMPONENT_NAME,
                styles: {
                  width: "100%",
                },
                props: {
                  children: {
                    type: "hbox",
                    styles: {
                      width: "stretch",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "2px 5px",
                    },
                    children: [
                      {
                        type: "component",
                        name: selectValueMeta.name,
                      },
                      {
                        type: "img",
                        src: "https://static1.plasmic.app/arrow-up.svg",
                        styles: {
                          height: "20px",
                          width: "20px",
                          transform: "rotate(180deg)",
                        },
                      },
                    ],
                  },
                },
              },
              {
                type: "component",
                name: POPOVER_COMPONENT_NAME,
                styles: {
                  backgroundColor: "white",
                  padding: "10px",
                  overflow: "scroll",
                },
                props: {
                  children: [
                    {
                      type: "component",
                      name: LIST_BOX_COMPONENT_NAME,
                      props: {
                        selectionMode: "single",
                      },
                      styles: {
                        borderWidth: 0,
                        width: "stretch",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    states: {
      selectedValue: {
        type: "writable",
        valueProp: "selectedKey",
        onChangeProp: "onSelectionChange",
        variableType: "text",
      },
      isOpen: {
        type: "writable",
        valueProp: "isOpen",
        onChangeProp: "onOpenChange",
        variableType: "boolean",
      },
    },
    trapsFocus: true,
  });
}
