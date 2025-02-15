import { CanvasTransformedBox } from "@/wab/client/components/canvas/CanvasTransformedBox";
import { useRerenderOnUserBodyChange } from "@/wab/client/components/canvas/UserBodyObserver";
import CommentPost from "@/wab/client/components/comments/CommentPost";
import CommentPostForm from "@/wab/client/components/comments/CommentPostForm";
import { useCommentsCtx } from "@/wab/client/components/comments/CommentsProvider";
import ThreadComments from "@/wab/client/components/comments/ThreadComments";
import {
  TplCommentThread,
  isCommentForFrame,
} from "@/wab/client/components/comments/utils";
import { Avatar } from "@/wab/client/components/studio/Avatar";
import {
  BASE_VARIANT_COLOR,
  NON_BASE_VARIANT_COLOR,
} from "@/wab/client/components/studio/GlobalCssVariables";
import { useStudioCtx } from "@/wab/client/studio-ctx/StudioCtx";
import { ViewCtx } from "@/wab/client/studio-ctx/view-ctx";
import { OnClickAway } from "@/wab/commons/components/OnClickAway";
import { AnyArena } from "@/wab/shared/Arenas";
import { ensure, ensureString, xGroupBy } from "@/wab/shared/common";
import { isTplVariantable } from "@/wab/shared/core/tpls";
import { ArenaFrame, ObjInst, TplNode } from "@/wab/shared/model/classes";
import { mkSemVerSiteElement } from "@/wab/shared/site-diffs";
import Chroma from "@/wab/shared/utils/color-utils";
import classNames from "classnames";
import $ from "jquery";
import { observer } from "mobx-react";
import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

function ObjInstLabel(props: { subject: ObjInst }) {
  const { subject } = props;

  const item = mkSemVerSiteElement(subject as any);
  const typeName = item.type;
  const objName = item.name;
  return (
    <>
      {objName ? (
        <>
          {typeName} <strong>{objName}</strong>
        </>
      ) : (
        "Unnamed " + typeName
      )}
    </>
  );
}

function ThreadWithHeader(props: { commentThread: TplCommentThread }) {
  const { commentThread } = props;

  const { bundler } = useCommentsCtx();

  const subject = bundler.objByAddr(commentThread.location.subject);

  return (
    <div>
      <h4 style={{ padding: "8px 16px" }}>
        <ObjInstLabel subject={subject} />
      </h4>
      <ThreadComments commentThread={commentThread} />
    </div>
  );
}

function CanvasCommentMarker(props: {
  commentThread: TplCommentThread;
  arenaFrame: ArenaFrame;
  viewCtx: ViewCtx;
  offsetLeft: number;
}) {
  const { commentThread, arenaFrame, viewCtx, offsetLeft } = props;

  const {
    bundler,
    usersMap,
    shownThreadId,
    setShownThreadId,
    shownArenaFrame,
    setShownArenaFrame,
  } = useCommentsCtx();

  const threadComments = commentThread.comments;
  const [comment] = threadComments;
  const subject = bundler.objByAddr(commentThread.location.subject) as TplNode;
  const author = ensure(
    usersMap.get(ensureString(comment.createdById)),
    "Comment author should exist"
  );
  const isSelected =
    shownThreadId === commentThread.id && arenaFrame === shownArenaFrame;
  const onClickAway = () => {
    setShownThreadId(undefined);
    setShownArenaFrame(undefined);
  };
  return (
    <CanvasCommentOverlay
      offsetLeft={offsetLeft}
      tpl={subject}
      viewCtx={viewCtx}
      className={"CommentMarker"}
      onClick={(e) => {
        if (!isSelected) {
          setShownThreadId(commentThread.id);
          setShownArenaFrame(arenaFrame);
        }
      }}
      isSelected={isSelected}
    >
      <div className={"CommentMarkerInitial"}>
        <Avatar user={author} />
      </div>
      <div className={"CommentMarkerHover"}>
        <CommentPost
          comment={comment}
          commentThread={commentThread}
          subjectLabel={<ObjInstLabel subject={subject} />}
          isThread
          isRootComment
          repliesLinkLabel={
            threadComments.length > 1
              ? `${threadComments.length - 1} replies`
              : "Reply"
          }
        />
      </div>
      {isSelected && (
        <OnClickAway onDone={onClickAway}>
          <div className={"CommentMarkerSelected"}>
            <ThreadWithHeader commentThread={commentThread} />
          </div>
        </OnClickAway>
      )}
    </CanvasCommentOverlay>
  );
}

function CanvasCommentPost(props: { viewCtx: ViewCtx; tpl: TplNode }) {
  const { viewCtx, tpl } = props;

  return (
    <CanvasCommentOverlay
      offsetLeft={0}
      tpl={tpl}
      viewCtx={viewCtx}
      className={"CommentPostMarker"}
    >
      <div className={"CommentPostFormMarker"}>
        <OnClickAway onDone={() => viewCtx.setSelectedNewThreadTpl(null)}>
          <CommentPostForm />
        </OnClickAway>
      </div>
    </CanvasCommentOverlay>
  );
}

export const CanvasCommentMarkers = observer(function CanvasCommentMarkers({
  arenaFrame,
}: {
  arena: AnyArena;
  arenaFrame: ArenaFrame;
}) {
  const studioCtx = useStudioCtx();

  const { allThreads } = useCommentsCtx();

  const viewCtx = studioCtx.tryGetViewCtxForFrame(arenaFrame);

  useRerenderOnUserBodyChange(studioCtx, viewCtx);

  const threadsGroupedBySubject = React.useMemo(
    () =>
      !viewCtx
        ? new Map()
        : xGroupBy(
            allThreads.filter(
              (commentThread) =>
                isCommentForFrame(studioCtx, viewCtx, commentThread) &&
                !commentThread.resolved // Only unresolved comments
            ),
            (commentThread) => commentThread.subject.uuid
          ),
    [allThreads, studioCtx, viewCtx]
  );

  if (!viewCtx) {
    return null;
  }

  const selectedNewThreadTpl = viewCtx.getSelectedNewThreadTpl();

  return (
    <>
      {selectedNewThreadTpl && (
        <CanvasCommentPost viewCtx={viewCtx} tpl={selectedNewThreadTpl} />
      )}
      {[...threadsGroupedBySubject.values()].map((subjectCommentThreads) =>
        subjectCommentThreads.map((commentThread, index) => (
          <CanvasCommentMarker
            offsetLeft={index * 20}
            key={commentThread.id}
            commentThread={commentThread}
            arenaFrame={arenaFrame}
            viewCtx={viewCtx}
          />
        ))
      )}
    </>
  );
});

export const CanvasCommentOverlay = observer(function CanvasCommentOverlay({
  tpl,
  children,
  viewCtx,
  onClick,
  className,
  isSelected,
  offsetLeft,
}: {
  tpl: TplNode;
  children?: ReactNode;
  viewCtx: ViewCtx;
  onClick?: (e: any) => void;
  className?: string;
  isSelected?: boolean;
  offsetLeft: number;
}) {
  // We directly use the render count here to make this component depend on it and re-render every time the render count changes
  // This is necessary for elements that are visible in the canvas conditionally (e.g. auto opened elements)
  const renderCount = viewCtx.renderCount;
  if (renderCount === 0) {
    return null;
  }

  const [_, doms] = viewCtx.maybeDomsForTpl(tpl, {
    ignoreFocusedCloneKey: true,
  });

  const $elt = $(doms ?? []);

  if (!$elt || $elt.length === 0) {
    return null;
  }

  const isTargetingSomeNonBaseVariant =
    isTplVariantable(tpl) &&
    viewCtx.variantTplMgr().isTargetingNonBaseVariant(tpl);

  const color = isTargetingSomeNonBaseVariant
    ? NON_BASE_VARIANT_COLOR
    : BASE_VARIANT_COLOR;

  return createPortal(
    <CanvasTransformedBox
      relativeTo={"arena"}
      $elt={$elt}
      viewCtx={viewCtx}
      className={classNames({
        "ElementHighlightBoxContainer CommentMarkerContainer": true,
        CommentMarkerContainerSelected: isSelected,
      })}
    >
      <div
        className={classNames({
          "ElementHighlightBoxRendered CommentMarkerOverlay": true,
        })}
        style={{
          borderColor: Chroma(color).alpha(0.1).css(),
          backgroundColor: Chroma(color).alpha(0.2).css(),
        }}
      />
      <div
        className={className}
        onClick={onClick}
        style={{
          left: `calc(100% - ${offsetLeft}px)`,
        }}
      >
        {children}
      </div>
    </CanvasTransformedBox>,
    ensure(document.querySelector(".canvas-editor__scaler"), "")
  );
});
