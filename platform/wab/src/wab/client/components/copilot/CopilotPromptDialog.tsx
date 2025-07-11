import CopilotMsg from "@/wab/client/components/CopilotMsg";
import {
  DefaultCopilotPromptDialogProps,
  PlasmicCopilotPromptDialog,
} from "@/wab/client/plasmic/plasmic_kit_data_binding/PlasmicCopilotPromptDialog";
import {
  ensure,
  isPrimitive,
  last,
  swallow,
  unexpected,
  withoutNils,
} from "@/wab/shared/common";
import { Popover, Tooltip } from "antd";
import * as React from "react";
import { FocusScope } from "react-aria";

import { CopilotPromptImage } from "@/wab/client/components/copilot/CopilotPromptImage";
import { dataPickerShouldHideKey } from "@/wab/client/components/sidebar-tabs/DataBinding/DataPickerUtil";
import { ImageUploader } from "@/wab/client/components/style-controls/ImageSelector";
import { useAsyncStrict } from "@/wab/client/hooks/useAsyncStrict";
import ImageUploadsIcon from "@/wab/client/plasmic/plasmic_kit/PlasmicIcon__ImageUploads";
import { isSubmitKeyCombo } from "@/wab/client/shortcuts/shortcut";
import { useStudioCtx } from "@/wab/client/studio-ctx/StudioCtx";
import { trackEvent } from "@/wab/client/tracking";
import { TokenType } from "@/wab/commons/StyleToken";
import {
  CopilotImage,
  CopilotImageType,
  copilotImageTypes,
  CopilotResponseData,
  QueryCopilotUiResponse,
} from "@/wab/shared/ApiSchema";
import { asDataUrl, parseDataUrl } from "@/wab/shared/data-urls";
import { DataSourceSchema } from "@plasmicapp/data-sources";
import { isString, range } from "lodash";
import defer = setTimeout;

export interface CopilotPromptDialogProps
  extends DefaultCopilotPromptDialogProps {
  data?: any;
  currentValue?: string;
  onUpdate: (newValue: string) => void;
  // A brief description of what the expression is supposed to be used for
  context?: string;
  // Only set when `isSql` is true
  dataSourceSchema?: DataSourceSchema;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  showImageUpload?: boolean;
  maxLength?: number;
}

function CopilotPromptDialog_({
  onUpdate,
  currentValue,
  data,
  context,
  type,
  dataSourceSchema,
  className,
  dialogOpen,
  onDialogOpenChange,
  showImageUpload,
  maxLength,
}: CopilotPromptDialogProps) {
  const [prompt, setPrompt] = React.useState("");
  const [submittedPrompt, setSubmittedPrompt] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [images, setImages] = React.useState<CopilotImage[]>([]);
  const promptInputRef: React.Ref<HTMLTextAreaElement> =
    React.useRef<HTMLTextAreaElement>(null);
  const applyBtnRef: React.Ref<HTMLDivElement> =
    React.useRef<HTMLDivElement>(null);
  const studioCtx = useStudioCtx();
  const historyType = type === "sql" ? "sql" : "custom-code";

  React.useEffect(() => {
    if (dialogOpen && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [dialogOpen, promptInputRef.current]);

  const copilotResponse = useAsyncStrict(async () => {
    if (!submittedPrompt) {
      // Prompt not ready yet
      return undefined;
    }

    try {
      let result: CopilotResponseData | QueryCopilotUiResponse;

      if (type === "ui") {
        result = await studioCtx.appCtx.api.queryUiCopilot({
          type: "ui",
          goal: prompt,
          projectId: studioCtx.siteInfo.id,
          images,
          tokens: studioCtx.site.styleTokens.map((t) => ({
            name: t.name,
            uuid: t.uuid,
            type: t.type as TokenType,
            value: t.value,
          })),
        });
      } else {
        result = await studioCtx.appCtx.api
          .queryCopilot({
            ...(type === "sql"
              ? {
                  type: "code-sql",
                  schema: ensure(dataSourceSchema, () => `Missing schema`),
                  currentCode: processCurrentCode(currentValue),
                  data: processData(data),
                }
              : {
                  type: "code",
                  context,
                  currentCode: processCurrentCode(currentValue),
                  data: processData(data),
                }),
            projectId: studioCtx.siteInfo.id,
            goal: prompt,
            ...(studioCtx.appCtx.appConfig.copilotClaude
              ? { useClaude: true }
              : {}),
          })
          .then((x) => {
            const res: CopilotResponseData = JSON.parse(x.response);
            return res;
          });
      }

      const replyMessage = getReplyMessage(result);

      if (replyMessage.response) {
        studioCtx.addToCopilotHistory(historyType, {
          prompt: submittedPrompt,
          response: replyMessage.response,
          displayMessage: replyMessage.displayMessage,
          id: result.copilotInteractionId,
        });
      }

      trackCopilotQuery({
        context,
        currentValue,
        data,
        prompt,
        result: replyMessage.response,
      });

      return result;
    } catch (err) {
      if (err.name === "CopilotRateLimitExceededError") {
        return "CopilotRateLimitExceededError";
      }
      throw err;
    }
    // Intentionally not depending on anything bug the prompt to trigger the
    // request, so for example we don't keep issuing requests whenever the
    // `data` changes due to state updates in the canvas
  }, [submittedPrompt]);

  const replyMessage = getReplyMessage(copilotResponse.value);

  React.useEffect(() => {
    defer(() => {
      if (replyMessage?.response && applyBtnRef.current) {
        applyBtnRef.current.focus();
      }
    });
  }, [replyMessage?.response]);

  const suggestionHistory = studioCtx.getCopilotHistory(historyType);
  const isValidPrompt =
    prompt && prompt.trim() !== submittedPrompt && !copilotResponse.loading;

  function getReplyMessage(
    value:
      | CopilotResponseData
      | QueryCopilotUiResponse
      | "CopilotRateLimitExceededError"
      | undefined
  ) {
    if (!value || value === "CopilotRateLimitExceededError") {
      return { response: undefined, displayMessage: undefined };
    }

    const response = isCopilotChatCompletionResponse(value)
      ? value?.data?.choices[0].message?.content ?? undefined
      : JSON.stringify(value.data);

    const messageParts: string[] = [];

    if (!isCopilotChatCompletionResponse(value)) {
      const actions = value.data?.actions || [];
      const hasHtmlDesign =
        actions.filter((action) => action.name === "insert-html")?.length > 0;
      if (hasHtmlDesign) {
        messageParts.push("- A new HTML design snippet is ready to be used.");
      }

      const newTokensCount =
        actions.filter((action) => action.name === "add-token")?.length ?? 0;
      if (newTokensCount > 0) {
        messageParts.push(
          `- ${newTokensCount} new token${
            newTokensCount > 1 ? "s" : ""
          } is ready to be used.`
        );
      }
    }

    return {
      response,
      displayMessage: type === "ui" ? messageParts.join("\n") : response,
    };
  }

  return (
    <PlasmicCopilotPromptDialog
      className={className}
      type={type}
      promptContainer={{
        style: {
          zIndex: 1,
        },
      }}
      promptInput={{
        imageUploadIcon: {
          render: () =>
            showImageUpload ? (
              <ImageUploader
                onUploaded={async (image, _file) => {
                  const dataUrl = parseDataUrl(image.url);
                  setImages((prev) => [
                    ...prev,
                    {
                      type: dataUrl.mediaType.split("/")[1] as CopilotImageType,
                      base64: dataUrl.data,
                    },
                  ]);
                }}
                accept={copilotImageTypes.map((t) => `.${t}`).join(",")}
                isDisabled={false}
              >
                <div className="flex dimfg p-sm">
                  <ImageUploadsIcon />
                </div>
              </ImageUploader>
            ) : null,
        },
        imageUploadContainer: {
          wrapChildren: () => {
            return images.map((image) => (
              <CopilotPromptImage
                img={{
                  src: asDataUrl(image.base64, `image/${image.type}`, "base64"),
                }}
                closeIconContainer={{
                  onClick: () => {
                    setImages((prev) =>
                      prev.filter((img) => img.base64 !== image.base64)
                    );
                  },
                }}
              />
            ));
          },
        },
        runPromptBtn: {
          props: {
            onClick: () => setSubmittedPrompt(prompt.trim()),
            disabled: !isValidPrompt,
          },
          wrap: (elt) => (
            <Tooltip title={"Run Copilot"} mouseEnterDelay={0.5}>
              {elt}
            </Tooltip>
          ),
        },
        showImageUpload,
        textAreaInput: {
          value: prompt,
          inputRef: promptInputRef,
          maxLength,
          rows: 1,
          autoFocus: true,
          onChange: (value) => setPrompt(value),
          onKeyDown: (e) => {
            if (isValidPrompt && isSubmitKeyCombo(e)) {
              e.preventDefault();
              setSubmittedPrompt(prompt.trim());
              promptInputRef.current?.blur();
              applyBtnRef.current?.focus();
            }
          },
        },
      }}
      history={{
        style: {
          fontSize: 16,
        },
      }}
      popoverPlaceholder={{
        render: ({ children }) => (
          <Popover
            open={dialogOpen}
            showArrow={false}
            placement={type === "ui" ? "top" : "leftTop"}
            onOpenChange={(visible) => {
              if (!visible) {
                onDialogOpenChange?.(false);
              }
            }}
            trigger="click"
            content={
              <FocusScope autoFocus contain>
                <div className="flex-col flex-vcenter flex-align-start pre copilot-no-background">
                  {children}
                </div>
              </FocusScope>
            }
            overlayClassName="copilot-no-background"
          >
            {
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "calc(100% - 40px)",
                  right: 0,
                  bottom: 0,
                  zIndex: 0,
                  margin: 0,
                }}
              ></div>
            }
          </Popover>
        ),
      }}
      cancelBtn={{
        onClick: () => {
          setShowHistory(false);
          onDialogOpenChange?.(false);
        },
        tooltip: "Close",
      }}
      historyBtn={{
        onClick: () => setShowHistory(!showHistory),
        tooltip: showHistory
          ? "Close suggestion history"
          : "Suggestion history",
      }}
      historyContents={{
        children: suggestionHistory.map(
          ({
            prompt: historyPrompt,
            response: historyResponse,
            displayMessage: historyDisplayMessage,
            id,
          }) => (
            <>
              <CopilotMsg userPrompt prompt={historyPrompt} />
              <CopilotMsg
                rightMargin
                code={historyDisplayMessage}
                key={id}
                copilotInteractionId={id}
                applyBtn={{
                  onClick: () => {
                    onUpdate(historyResponse);
                    onDialogOpenChange?.(false);
                    setShowHistory(false);
                  },
                  onKeyPress: (e) => {
                    if (e.key === "Enter") {
                      onUpdate(historyResponse);
                      onDialogOpenChange?.(false);
                      setShowHistory(false);
                    }
                  },
                }}
              />
            </>
          )
        ),
      }}
      promptDialog={{
        style: {
          // We copy the box shadow from antd to inside the sizer container
          boxShadow:
            "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
        },
      }}
      {...(dialogOpen
        ? showHistory
          ? suggestionHistory.length > 0
            ? {
                state: "history",
              }
            : { state: "historyEmpty" }
          : copilotResponse.loading
          ? {
              state: "loading",
            }
          : copilotResponse.error !== undefined
          ? {
              state: "error",
            }
          : copilotResponse.value === "CopilotRateLimitExceededError"
          ? {
              state: "quotaExceeded",
            }
          : (() => {
              return {
                state: "ready",
                ...(replyMessage.response
                  ? {
                      reply: {
                        props: {
                          key: copilotResponse.value?.copilotInteractionId,
                          applyBtn: {
                            onClick: () => {
                              onUpdate(
                                ensure(replyMessage.response, "No message")
                              );
                              onDialogOpenChange?.(false);
                              setShowHistory(false);
                            },
                            onKeyPress: (e) => {
                              if (e.key === "Enter") {
                                onUpdate(
                                  ensure(replyMessage.response, "No message")
                                );
                                onDialogOpenChange?.(false);
                                setShowHistory(false);
                              }
                            },
                            ref: applyBtnRef,
                          },
                          copilotInteractionId:
                            copilotResponse.value?.copilotInteractionId,
                          code: replyMessage.displayMessage,
                        },
                      },
                    }
                  : {
                      reply: {
                        render: () => null,
                      },
                    }),
              };
            })()
        : {})}
    />
  );
}

function processCurrentCode(currentCode: string | undefined) {
  // Max current code size
  const THRESHOLD = 3000;
  return currentCode && currentCode.length > THRESHOLD
    ? undefined
    : currentCode;
}

function trackCopilotQuery({
  prompt,
  context,
  currentValue,
  data,
  result,
}: {
  prompt: string;
  context: string | undefined;
  currentValue: string | undefined;
  data: any;
  result: string | undefined;
}) {
  const truncateCode = (code: string | undefined) =>
    code &&
    (code.length <= 500
      ? code
      : `${code.slice(0, 250)}\n// ...\n${code.slice(-250)}`);
  trackEvent("Run Copilot query", {
    prompt,
    context,
    currentCode: truncateCode(currentValue),
    env:
      data && typeof data === "object"
        ? JSON.stringify(
            Object.entries(data).map(([k, v]) =>
              k.startsWith("$") && v && typeof v === "object"
                ? [k, Object.keys(v)]
                : [k, typeof v]
            ),
            undefined,
            2
          )
        : undefined,
    result: truncateCode(result),
  });
}

function processData(data: Record<string, any>) {
  const depthRange = range(7, 2, -1);
  for (const maxDepth of depthRange) {
    const rec = (v: any, depth: number, path: (string | number)[]) => {
      if (isPrimitive(v)) {
        if (isString(v) && v.length > 25) {
          return `${v.slice(0, 20)}...`;
        }
        return v;
      }
      if (depth > maxDepth) {
        return Array.isArray(v) ? [] : {};
      }
      if (Array.isArray(v)) {
        return (v.length > 3 ? [...v.slice(0, 3), "... (long array"] : v).map(
          (val, i) => rec(val, depth + 1, [...path, i])
        );
      } else {
        return Object.fromEntries(
          withoutNils(
            Object.keys(v).map((key) =>
              swallow(() =>
                typeof v[key] === "function" ||
                dataPickerShouldHideKey(key, v, path, {
                  showAdvancedFields: true,
                })
                  ? null
                  : ([key, rec(v[key], depth + 1, [...path, key])] as const)
              )
            )
          ).slice(0, 50)
        );
      }
    };
    const res = rec(data, 1, []);
    // Max data size
    const THRESHOLD = 2500;
    if (
      (JSON.stringify(res)?.length ?? 0) <= THRESHOLD ||
      maxDepth === last(depthRange)
    ) {
      return res;
    }
  }
  unexpected();
}

function isCopilotChatCompletionResponse(
  result: QueryCopilotUiResponse | CopilotResponseData
): result is CopilotResponseData {
  return !!result.data && "choices" in result.data;
}

const CopilotPromptDialog = React.forwardRef(CopilotPromptDialog_);
export { CopilotPromptDialog };
