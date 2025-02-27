// @ts-nocheck
/* eslint-disable */
/* tslint:disable */
/* prettier-ignore-start */

/** @jsxRuntime classic */
/** @jsx createPlasmicElementProxy */
/** @jsxFrag React.Fragment */

// This class is auto-generated by Plasmic; please do not edit!
// Plasmic Project: gtUDvxG6cmBbSzqLikNzoP
// Component: T79mlJEJy9
import * as React from "react";

import * as p from "@plasmicapp/react-web";

import {
  SingleChoiceArg,
  StrictProps,
  classNames,
  createPlasmicElementProxy,
  deriveRenderOpts,
  hasVariant,
} from "@plasmicapp/react-web";
import Button from "../../components/widgets/Button"; // plasmic-import: SEF-sRmSoqV5c/component

import "@plasmicapp/react-web/lib/plasmic.css";

import projectcss from "./plasmic_plasmic_kit_optimize.module.css"; // plasmic-import: gtUDvxG6cmBbSzqLikNzoP/projectcss
import sty from "./PlasmicExperimentCanvasButton.module.css"; // plasmic-import: T79mlJEJy9/css

import ArrowUpLeftsvgIcon from "../plasmic_kit_icons/icons/PlasmicIcon__ArrowUpLeftSvg"; // plasmic-import: AulWJRWcB/icon

export type PlasmicExperimentCanvasButton__VariantMembers = {
  type: "abTest" | "segement" | "scheduled";
};

export type PlasmicExperimentCanvasButton__VariantsArgs = {
  type?: SingleChoiceArg<"abTest" | "segement" | "scheduled">;
};

type VariantPropType = keyof PlasmicExperimentCanvasButton__VariantsArgs;
export const PlasmicExperimentCanvasButton__VariantProps =
  new Array<VariantPropType>("type");

export type PlasmicExperimentCanvasButton__ArgsType = {};
type ArgPropType = keyof PlasmicExperimentCanvasButton__ArgsType;
export const PlasmicExperimentCanvasButton__ArgProps = new Array<ArgPropType>();

export type PlasmicExperimentCanvasButton__OverridesType = {
  root?: p.Flex<typeof Button>;
  svg?: p.Flex<"svg">;
  text?: p.Flex<"div">;
};

export interface DefaultExperimentCanvasButtonProps {
  type?: SingleChoiceArg<"abTest" | "segement" | "scheduled">;
  className?: string;
}

export const defaultExperimentCanvasButton__Args: Partial<PlasmicExperimentCanvasButton__ArgsType> =
  {};

function PlasmicExperimentCanvasButton__RenderFunc(props: {
  variants: PlasmicExperimentCanvasButton__VariantsArgs;
  args: PlasmicExperimentCanvasButton__ArgsType;
  overrides: PlasmicExperimentCanvasButton__OverridesType;

  forNode?: string;
}) {
  const { variants, overrides, forNode } = props;
  const args = Object.assign(
    {},
    defaultExperimentCanvasButton__Args,
    props.args
  );

  const $props = args;

  return (
    <Button
      data-plasmic-name={"root"}
      data-plasmic-override={overrides.root}
      data-plasmic-root={true}
      data-plasmic-for-node={forNode}
      className={classNames("__wab_instance", sty.root, {
        [sty.roottype_abTest]: hasVariant(variants, "type", "abTest"),
      })}
      startIcon={
        <ArrowUpLeftsvgIcon
          data-plasmic-name={"svg"}
          data-plasmic-override={overrides.svg}
          className={classNames(projectcss.all, sty.svg, {
            [sty.svgtype_segement]: hasVariant(variants, "type", "segement"),
          })}
          role={"img"}
        />
      }
      withIcons={"startIcon" as const}
    >
      <div
        data-plasmic-name={"text"}
        data-plasmic-override={overrides.text}
        className={classNames(projectcss.all, projectcss.__wab_text, sty.text, {
          [sty.texttype_scheduled]: hasVariant(variants, "type", "scheduled"),
          [sty.texttype_segement]: hasVariant(variants, "type", "segement"),
        })}
      >
        {hasVariant(variants, "type", "scheduled")
          ? "Edit Schedule"
          : hasVariant(variants, "type", "segement")
          ? "Edit Targeting"
          : "Edit A/B Test"}
      </div>
    </Button>
  ) as React.ReactElement | null;
}

const PlasmicDescendants = {
  root: ["root", "svg", "text"],
  svg: ["svg"],
  text: ["text"],
} as const;
type NodeNameType = keyof typeof PlasmicDescendants;
type DescendantsType<T extends NodeNameType> =
  (typeof PlasmicDescendants)[T][number];
type NodeDefaultElementType = {
  root: typeof Button;
  svg: "svg";
  text: "div";
};

type ReservedPropsType = "variants" | "args" | "overrides";
type NodeOverridesType<T extends NodeNameType> = Pick<
  PlasmicExperimentCanvasButton__OverridesType,
  DescendantsType<T>
>;

type NodeComponentProps<T extends NodeNameType> =
  // Explicitly specify variants, args, and overrides as objects
  {
    variants?: PlasmicExperimentCanvasButton__VariantsArgs;
    args?: PlasmicExperimentCanvasButton__ArgsType;
    overrides?: NodeOverridesType<T>;
  } & Omit<PlasmicExperimentCanvasButton__VariantsArgs, ReservedPropsType> & // Specify variants directly as props
    // Specify args directly as props
    Omit<PlasmicExperimentCanvasButton__ArgsType, ReservedPropsType> &
    // Specify overrides for each element directly as props
    Omit<
      NodeOverridesType<T>,
      ReservedPropsType | VariantPropType | ArgPropType
    > &
    // Specify props for the root element
    Omit<
      Partial<React.ComponentProps<NodeDefaultElementType[T]>>,
      ReservedPropsType | VariantPropType | ArgPropType | DescendantsType<T>
    >;

function makeNodeComponent<NodeName extends NodeNameType>(nodeName: NodeName) {
  type PropsType = NodeComponentProps<NodeName> & { key?: React.Key };
  const func = function <T extends PropsType>(
    props: T & StrictProps<T, PropsType>
  ) {
    const { variants, args, overrides } = deriveRenderOpts(props, {
      name: nodeName,
      descendantNames: [...PlasmicDescendants[nodeName]],
      internalArgPropNames: PlasmicExperimentCanvasButton__ArgProps,
      internalVariantPropNames: PlasmicExperimentCanvasButton__VariantProps,
    });

    return PlasmicExperimentCanvasButton__RenderFunc({
      variants,
      args,
      overrides,
      forNode: nodeName,
    });
  };
  if (nodeName === "root") {
    func.displayName = "PlasmicExperimentCanvasButton";
  } else {
    func.displayName = `PlasmicExperimentCanvasButton.${nodeName}`;
  }
  return func;
}

export const PlasmicExperimentCanvasButton = Object.assign(
  // Top-level PlasmicExperimentCanvasButton renders the root element
  makeNodeComponent("root"),
  {
    // Helper components rendering sub-elements
    svg: makeNodeComponent("svg"),
    text: makeNodeComponent("text"),

    // Metadata about props expected for PlasmicExperimentCanvasButton
    internalVariantProps: PlasmicExperimentCanvasButton__VariantProps,
    internalArgProps: PlasmicExperimentCanvasButton__ArgProps,
  }
);

export default PlasmicExperimentCanvasButton;
/* prettier-ignore-end */
