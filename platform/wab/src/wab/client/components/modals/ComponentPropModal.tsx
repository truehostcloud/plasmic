import { PropValueEditor } from "@/wab/client/components/sidebar-tabs/PropValueEditor";
import ParamSection from "@/wab/client/components/sidebar-tabs/StateManagement/ParamSection";
import { SidebarModal } from "@/wab/client/components/sidebar/SidebarModal";
import {
  IconLinkButton,
  IFrameAwareDropdownMenu,
} from "@/wab/client/components/widgets";
import { Icon } from "@/wab/client/components/widgets/Icon";
import { IconButton } from "@/wab/client/components/widgets/IconButton";
import LabeledListItem from "@/wab/client/components/widgets/LabeledListItem";
import { Modal } from "@/wab/client/components/widgets/Modal";
import Select from "@/wab/client/components/widgets/Select";
import Textbox from "@/wab/client/components/widgets/Textbox";
import DotsVerticalIcon from "@/wab/client/plasmic/plasmic_kit/PlasmicIcon__DotsVertical";
import PlusIcon from "@/wab/client/plasmic/plasmic_kit/PlasmicIcon__Plus";
import { StudioCtx } from "@/wab/client/studio-ctx/StudioCtx";
import {
  getPropTypeType,
  PropTypeType,
  StudioPropType,
  wabTypeToPropType,
} from "@/wab/shared/code-components/code-components";
import {
  assert,
  ensure,
  mkShortId,
  spawn,
  unexpected,
} from "@/wab/shared/common";
import { canRenameParam } from "@/wab/shared/core/components";
import { clone, codeLit, tryExtractJson } from "@/wab/shared/core/exprs";
import { mkParam } from "@/wab/shared/core/lang";
import { cloneType } from "@/wab/shared/core/tpls";
import { COMPONENT_PROP_CAP } from "@/wab/shared/Labels";
import {
  Component,
  Expr,
  FunctionType,
  isKnownDataSourceOpExpr,
  isKnownEventHandler,
  isKnownExpr,
  isKnownFunctionType,
  isKnownImageAssetRef,
  isKnownPageHref,
  isKnownRenderableType,
  isKnownRenderFuncType,
  isKnownStyleTokenRef,
  Param,
} from "@/wab/shared/model/classes";
import { typeDisplayName, typeFactory } from "@/wab/shared/model/model-util";
import { smartHumanize } from "@/wab/shared/strs";
import { Menu } from "antd";
import { isNaN } from "lodash";
import React from "react";

/**
 * We have lots of prop/param types.
 * This value can be one of the following types:
 * - WAB param type
 * - Component prop type (see @plasmicapp/host prop-types.ts)
 */
type PropTypeData = {
  value: Param["type"]["name"] | PropTypeType;
  label: string;
  /** The JSON type for the prop type, or false if it must be an Expr. */
  jsonType: false | "boolean" | "number" | "string" | "any";
  /** The Expr's typeguard check function like `isKnownPageHref`. */
  exprTypeGuard?: (expr: Expr) => boolean;
};

// Check that the values match @plasmicapp/host prop-types.ts
const COMPONENT_PARAM_TYPES_CONFIG = [
  { value: "text", label: "Text", jsonType: "string" },
  { value: "num", label: "Number", jsonType: "number" },
  { value: "bool", label: "Toggle", jsonType: "boolean" },
  { value: "any", label: "Object", jsonType: "any" }, // any / Object = JsonValue, NOT JsonObject
  {
    value: "queryData",
    label: "Query data",
    jsonType: "any",
    exprTypeGuard: isKnownDataSourceOpExpr,
  },
  {
    value: "eventHandler",
    label: "Function",
    jsonType: false,
    exprTypeGuard: isKnownEventHandler,
  },
  {
    value: "href",
    label: "Link URL",
    jsonType: "string", // can be external URL
    exprTypeGuard: isKnownPageHref, // can be local page href
  },
  { value: "dateString", label: "Date", jsonType: "string" },
  { value: "dateRangeStrings", label: "Date range", jsonType: "string" },
  {
    value: "color",
    label: "Color",
    jsonType: "string", // can be CSS color
    exprTypeGuard: isKnownStyleTokenRef, // can be token
  },
  {
    value: "img",
    label: "Image",
    jsonType: "string", // can be external image URL
    exprTypeGuard: isKnownImageAssetRef, // can be image asset
  },
] as const satisfies readonly PropTypeData[];

function getComponentParamTypeOption(
  paramType: ComponentParamTypeOptions
): PropTypeData | undefined {
  return COMPONENT_PARAM_TYPES_CONFIG.find((opt) => opt.value === paramType);
}

type ComponentParamTypeOptions =
  (typeof COMPONENT_PARAM_TYPES_CONFIG)[number]["value"];

function isExprValid(propTypeData: PropTypeData | undefined, val: Expr) {
  // There may be some prop types we haven't handled when linking code component props.
  if (!propTypeData) {
    return true;
  }

  if (propTypeData.exprTypeGuard?.(val)) {
    return true;
  } else if (propTypeData.jsonType) {
    if (propTypeData.jsonType === "any") {
      return true;
    }

    const lit = tryExtractJson(val);
    if (propTypeData.jsonType === "number") {
      const numeric = typeof lit === "string" ? +lit : lit;
      return !isNaN(numeric);
    } else if (propTypeData.jsonType === "boolean") {
      return typeof lit === "boolean";
    } else if (propTypeData.jsonType === "string") {
      return typeof lit === "string";
    } else {
      unexpected(
        `invalid jsonData ${propTypeData.jsonType} on propTypeData: ${propTypeData.value}`
      );
    }
  } else {
    unexpected(`invalid propTypeData: ${propTypeData.value}`);
  }
}

export function ComponentPropModal(props: {
  studioCtx: StudioCtx;
  component: Component;
  visible: boolean;
  existingParam?: Param;
  onFinish: (newParam?: Param) => void;
  type?: Param["type"];
  centeredModal?: boolean;
  suggestedName?: string;
}) {
  const {
    studioCtx,
    component,
    visible,
    onFinish,
    existingParam,
    centeredModal,
    suggestedName,
  } = props;

  const type = props.type ?? existingParam?.type;
  const [paramName, setParamName] = React.useState(
    existingParam?.variable.name ?? suggestedName ?? ""
  );
  const [paramType, setParamType] = React.useState<ComponentParamTypeOptions>(
    (isKnownFunctionType(type)
      ? "eventHandler"
      : (type?.name as ComponentParamTypeOptions)) ?? "text"
  );

  const paramTypeData = getComponentParamTypeOption(paramType);

  const [defaultExpr, setDefaultExpr] = React.useState<Expr | undefined>(
    existingParam && existingParam.defaultExpr
      ? existingParam.defaultExpr
      : undefined
  );
  const [previewExpr, setPreviewExpr] = React.useState<Expr | undefined>(
    existingParam && existingParam.previewExpr
      ? existingParam.previewExpr
      : undefined
  );
  const [defaultArgs, setDefaultArgs] = React.useState<
    { name: string; type: string; key: string }[]
  >(
    existingParam && isKnownFunctionType(existingParam.type)
      ? deriveArgTypes(existingParam.type)
      : []
  );
  const isLocalizationEnabled = studioCtx.site.flags.usePlasmicTranslation;
  const [isLocalizable, setIsLocalizable] = React.useState(
    existingParam && isLocalizationEnabled ? existingParam.isLocalizable : false
  );

  const isValid = React.useMemo(
    () =>
      paramName &&
      paramType &&
      (defaultExpr === undefined || isExprValid(paramTypeData, defaultExpr)) &&
      (previewExpr === undefined || isExprValid(paramTypeData, previewExpr)),
    [paramName, paramType, type, defaultExpr, previewExpr]
  );

  const onSave = async () => {
    if (!isValid) {
      return;
    }

    await studioCtx.change(({ success }) => {
      const newParamType = type
        ? cloneType(type)
        : paramType !== "eventHandler"
        ? typeFactory[paramType]()
        : typeFactory.func(
            ...defaultArgs
              .filter((arg) => arg.name !== "")
              .map((arg) => typeFactory.arg(arg.name, typeFactory[arg.type]()))
          );
      const name = studioCtx
        .tplMgr()
        .getUniqueParamName(component, paramName, existingParam);
      const isLocalizableVal =
        paramType === "text" && isLocalizationEnabled ? isLocalizable : false;
      if (existingParam) {
        studioCtx.tplMgr().renameParam(component, existingParam, name);
        existingParam.type = newParamType;
        existingParam.defaultExpr = defaultExpr && clone(defaultExpr);
        existingParam.previewExpr = previewExpr && clone(previewExpr);
        existingParam.isLocalizable = isLocalizableVal;
        onFinish(existingParam);
        return success();
      } else {
        assert(
          !isKnownRenderableType(newParamType) &&
            !isKnownRenderFuncType(newParamType),
          () => `Didn't expect slot type`
        );
        const param = mkParam({
          name,
          type: newParamType,
          paramType: "prop",
          description: "metaProp",
          defaultExpr,
          previewExpr,
          isLocalizable: isLocalizableVal,
        });
        component.params.push(param);
        onFinish(param);
        return success();
      }
    });
  };

  const canRename = !existingParam || canRenameParam(component, existingParam);

  const updateDefaultArg = (
    key: string,
    updateValues: Record<string, string>
  ) => {
    setDefaultArgs((prev) =>
      prev.map((arg) => (arg.key === key ? { ...arg, ...updateValues } : arg))
    );
  };

  let propEditorType =
    paramType !== "eventHandler"
      ? wabTypeToPropType(type ?? typeFactory[paramType]())
      : undefined;
  if (getPropTypeType(propEditorType) === "dataSourceOpData") {
    propEditorType = wabTypeToPropType(typeFactory["any"]());
  }

  const modalContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        spawn(onSave());
      }}
    >
      <ParamSection
        fixedParamType={!!type}
        defaultArgs={defaultArgs.map((arg) => (
          <LabeledListItem
            key={arg.key}
            labelSize="half"
            label={
              <Textbox
                defaultValue={arg.name}
                onEdit={(val) => updateDefaultArg(arg.key, { name: val })}
                styleType={["bordered"]}
                placeholder="arg name"
                data-test-id="arg-name"
              />
            }
            padding={["noLabel", "noContent", "noHorizontal"]}
            onDelete={() =>
              setDefaultArgs((prev) =>
                prev.filter((pArg) => pArg.key !== arg.key)
              )
            }
          >
            <Select
              type={"bordered"}
              style={{ width: "100%" }}
              value={arg.type}
              onChange={(val) =>
                val && updateDefaultArg(arg.key, { type: val })
              }
              data-test-id="arg-type"
            >
              {COMPONENT_PARAM_TYPES_CONFIG.filter(
                (opt) => !!opt.jsonType && !("exprTypeGuard" in opt)
              ).map(({ value, label }) => (
                <Select.Option value={value} textValue={label} key={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </LabeledListItem>
        ))}
        plusIcon={
          <IconLinkButton
            onClick={() =>
              setDefaultArgs((prev) => [
                ...prev,
                { name: "", type: "text", key: mkShortId() },
              ])
            }
            type="button"
            data-test-id="add-arg"
          >
            <Icon icon={PlusIcon} />
          </IconLinkButton>
        }
        specialParamType={
          paramType === "eventHandler"
            ? "eventHandler"
            : paramType === "text" && isLocalizationEnabled
            ? "localizable"
            : undefined
        }
        hideEventArgs={!!type && paramType === "eventHandler"}
        overrides={{
          paramName: {
            props: {
              defaultValue: paramName,
              onChange: (e) => setParamName(e.target.value),
              "data-test-id": "prop-name",
              disabled: !canRename,
            },
          },
          existingParamType: {
            value: type && smartHumanize(typeDisplayName(type, true)),
            disabled: true,
          },
          paramType: {
            props: {
              value: paramType,
              onChange: (val) => {
                if (val) {
                  setParamType(val as ComponentParamTypeOptions);
                  setDefaultExpr(val === "bool" ? codeLit(false) : undefined);
                  setIsLocalizable(false);
                }
              },
              children: COMPONENT_PARAM_TYPES_CONFIG.map(({ value, label }) => (
                <Select.Option value={value} textValue={label} key={value}>
                  {label}
                </Select.Option>
              )),
              "data-test-id": "prop-type",
            },
          },
          defaultValue: {
            render: () =>
              paramType !== "eventHandler" && (
                <PropValueEditorWithMenu
                  attr="default-value"
                  label={paramName || "New prop"}
                  propType={ensure(
                    propEditorType,
                    "propEditorType should only be undefined if paramType equals eventHandler"
                  )}
                  propTypeData={paramTypeData}
                  value={defaultExpr}
                  onChange={setDefaultExpr}
                />
              ),
          },
          previewValue: {
            render: () =>
              paramType !== "eventHandler" && (
                <PropValueEditorWithMenu
                  attr="preview-value"
                  label={paramName || "New prop"}
                  propType={ensure(
                    propEditorType,
                    "propEditorType should only be undefined if paramType equals eventHandler"
                  )}
                  propTypeData={paramTypeData}
                  value={previewExpr}
                  onChange={setPreviewExpr}
                />
              ),
          },
          localizableSwitch: {
            isChecked: isLocalizable,
            onChange: (val) => setIsLocalizable(val),
          },
          confirmBtn: {
            props: {
              disabled: !isValid,
              htmlType: "submit",
              onClick: () => {
                spawn(onSave());
              },
              "data-test-id": "prop-submit",
            },
          },
          cancelBtn: { onClick: () => onFinish() },
        }}
      />
    </form>
  );

  if (centeredModal) {
    return (
      <Modal
        open
        footer={null}
        title={`New ${COMPONENT_PROP_CAP}`}
        onCancel={() => onFinish()}
      >
        {modalContent}
      </Modal>
    );
  } else {
    return (
      <SidebarModal
        show={visible}
        title={
          existingParam
            ? `Edit ${existingParam.variable.name}`
            : `New ${COMPONENT_PROP_CAP}`
        }
        onClose={() => onFinish()}
      >
        {modalContent}
      </SidebarModal>
    );
  }
}

/** Wraps a PropValueEditor and menu for unsetting the value. */
const PropValueEditorWithMenu: React.FC<{
  attr: "default-value" | "preview-value";
  label: string;
  propType: StudioPropType<any>;
  propTypeData: PropTypeData | undefined;
  value: Expr | undefined;
  onChange: (expr: Expr | undefined) => void;
}> = ({ attr, label, value, onChange, propType, propTypeData }) => {
  return (
    <div className="generic-prop-editor" data-test-id={attr}>
      <PropValueEditor
        attr={attr}
        label={label}
        value={
          value === undefined
            ? undefined
            : propTypeData?.exprTypeGuard?.(value)
            ? value
            : propTypeData?.jsonType
            ? tryExtractJson(value)
            : undefined
        }
        onChange={(val) => {
          const expr =
            val == null || val === ""
              ? undefined
              : isKnownExpr(val)
              ? val
              : codeLit(val);
          if (expr === undefined || isExprValid(propTypeData, expr)) {
            onChange(expr);
          } else {
            unexpected(
              `PropValueEditor returned value that doesn't satisfy ${propTypeData?.value}`
            );
          }
        }}
        propType={propType}
      />
      <IFrameAwareDropdownMenu
        menu={
          <Menu>
            <Menu.Item onClick={() => onChange(undefined)}>Unset</Menu.Item>
          </Menu>
        }
      >
        <IconButton data-test-id={`${attr}-menu-btn`}>
          <DotsVerticalIcon />
        </IconButton>
      </IFrameAwareDropdownMenu>
    </div>
  );
};

function deriveArgTypes(type: FunctionType) {
  return type.params.map((arg) => ({
    name: arg.argName,
    type: arg.type.name,
    key: mkShortId(),
  }));
}
