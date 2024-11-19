import React from "react";
import type { RadioGroupProps } from "react-aria-components";
import { RadioGroup } from "react-aria-components";
import { getCommonProps } from "./common";
import { PlasmicRadioGroupContext } from "./contexts";
import { DESCRIPTION_COMPONENT_NAME } from "./registerDescription";
import { LABEL_COMPONENT_NAME } from "./registerLabel";
import { makeDefaultRadioChildren, registerRadio } from "./registerRadio";
import {
  CodeComponentMetaOverrides,
  Registerable,
  makeChildComponentName,
  makeComponentName,
  registerComponentHelper,
} from "./utils";
import { WithVariants, pickAriaComponentVariants } from "./variant-utils";

const RADIO_GROUP_VARIANTS = ["disabled" as const, "readonly" as const];

export interface BaseRadioGroupProps
  extends RadioGroupProps,
    WithVariants<typeof RADIO_GROUP_VARIANTS> {
  children: React.ReactNode;
}

const { variants, withObservedValues } =
  pickAriaComponentVariants(RADIO_GROUP_VARIANTS);

export function BaseRadioGroup(props: BaseRadioGroupProps) {
  const { children, plasmicUpdateVariant, ...rest } = props;

  return (
    <PlasmicRadioGroupContext.Provider value={props}>
      <RadioGroup {...rest}>
        {({ isDisabled, isReadOnly }) =>
          withObservedValues(
            children,
            {
              disabled: isDisabled,
              readonly: isReadOnly,
            },
            plasmicUpdateVariant
          )
        }
      </RadioGroup>
    </PlasmicRadioGroupContext.Provider>
  );
}

const RADIO_GROUP_COMPONENT_NAME = makeComponentName("radioGroup");

export function registerRadioGroup(
  loader?: Registerable,
  overrides?: CodeComponentMetaOverrides<typeof BaseRadioGroup>
) {
  const thisName = makeChildComponentName(
    overrides?.parentComponentName,
    RADIO_GROUP_COMPONENT_NAME
  );

  const radioMeta = registerRadio(loader, { parentComponentName: thisName });

  registerComponentHelper(
    loader,
    BaseRadioGroup,
    {
      name: RADIO_GROUP_COMPONENT_NAME,
      displayName: "Aria RadioGroup",
      importPath: "@plasmicpkgs/react-aria/skinny/registerRadioGroup",
      importName: "BaseRadioGroup",
      variants,
      props: {
        ...getCommonProps<BaseRadioGroupProps>("radio group", [
          "name",
          "isDisabled",
          "isReadOnly",
          "aria-label",
          "isRequired",
        ]),
        children: {
          type: "slot",
          defaultValue: [
            {
              type: "vbox",
              styles: {
                display: "flex",
                gap: "5px",
                padding: 0,
                alignItems: "flex-start",
              },
              children: [
                {
                  type: "component",
                  name: LABEL_COMPONENT_NAME,
                  props: {
                    children: {
                      type: "text",
                      value: "Radio Group",
                    },
                  },
                },
                {
                  type: "component",
                  name: radioMeta.name,
                  props: {
                    children: makeDefaultRadioChildren("Radio 1"),
                    value: "radio1",
                  },
                },
                {
                  type: "component",
                  name: radioMeta.name,
                  props: {
                    children: makeDefaultRadioChildren("Radio 2"),
                    value: "radio2",
                  },
                },
                {
                  type: "component",
                  name: radioMeta.name,
                  props: {
                    children: makeDefaultRadioChildren("Radio 3"),
                    value: "radio3",
                  },
                },
                {
                  type: "component",
                  name: DESCRIPTION_COMPONENT_NAME,
                  props: {
                    children: {
                      type: "text",
                      value:
                        "Use the registered variants to see it in action...",
                    },
                  },
                },
              ],
            },
          ],
        },
        value: {
          type: "string",
          editOnly: true,
          displayName: "Initial value",
          uncontrolledProp: "defaultValue",
          description: "The current value",
        },
        isInvalid: {
          displayName: "Invalid",
          type: "boolean",
          description: "Whether the input value is invalid",
          defaultValueHint: false,
        },
        validationBehavior: {
          type: "choice",
          options: ["native", "aria"],
          description:
            "Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA.",
          defaultValueHint: "native",
        },
        onChange: {
          type: "eventHandler",
          argTypes: [{ name: "value", type: "string" }],
        },
      },
      states: {
        value: {
          type: "writable",
          valueProp: "value",
          onChangeProp: "onChange",
          variableType: "array",
        },
      },
      trapsFocus: true,
    },
    overrides
  );
}
