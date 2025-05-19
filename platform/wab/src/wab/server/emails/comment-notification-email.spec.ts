import {
  Notification,
  sendUserNotificationEmail,
} from "@/wab/server/emails/comment-notification-email";
import { setupEmailTest } from "@/wab/server/emails/test/email-test-util";
import { getTeamAndWorkspace } from "@/wab/server/test/backend-util";
import {
  createNotification,
  withEndUserNotificationSetup,
} from "@/wab/server/test/comments-util";
import {
  CommentId,
  CommentReactionId,
  CommentThreadId,
  ProjectId,
  ThreadHistoryId,
} from "@/wab/shared/ApiSchema";
import { fullName } from "@/wab/shared/ApiSchemaUtil";
import * as uuid from "uuid";

// Utility function to normalize HTML by removing extra whitespace
const normalizeHtml = (html) => html.replace(/\s+/g, " ");

describe("sendUserNotificationEmail", () => {
  it("sends an email with notifications grouped by project for only root comment(new thread)", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        const { req, config, mailer } = setupEmailTest();

        // User 1 comment
        const user1Comment = await userDbs[1]().postRootCommentInProject(
          { projectId: project.id },
          {
            body: "comment text",
            location: { subject: { uuid: "", iid: "" }, variants: [] },
            commentId: uuid.v4() as CommentId,
            commentThreadId: uuid.v4() as CommentThreadId,
          }
        );

        // Mock input
        const notifications: Map<
          ProjectId,
          Map<CommentThreadId, Notification[]>
        > = new Map<ProjectId, Map<CommentThreadId, Notification[]>>([
          [
            project.id,
            new Map([
              [
                user1Comment.commentThreadId,
                [
                  await createNotification(
                    user1Comment.commentThreadId,
                    users[0],
                    project,
                    user1Comment.createdAt,
                    { type: "COMMENT", comment: user1Comment },
                    sudo
                  ),
                ],
              ],
            ]),
          ],
        ]);

        const expectedEmailBody = normalizeHtml(
          `<p> You have new activity in your projects:</p> <div><h2>New updates in project: <a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${
            project.name
          }</a></h2><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${user1Comment.body}</a> by <strong>${fullName(
            users[1]
          )}</strong></p></div> <p>If you wish  to modify your notification settings, please visit the appropriate section in Plasmic Studio.</p>`
        );

        await sendUserNotificationEmail(
          mailer,
          notifications,
          req.config.host,
          config.mailFrom,
          req.config.mailBcc // Optional BCC
        );

        // Get the actual email body sent
        const receivedHtml = normalizeHtml(
          mailer.sendMail.mock.calls[0][0].html
        );

        // Assert that the normalized HTML matches
        expect(receivedHtml).toBe(expectedEmailBody);

        // Assert other email properties
        expect(mailer.sendMail).toHaveBeenCalledWith({
          from: config.mailFrom,
          to: users[0].email,
          bcc: req.config.mailBcc,
          subject: "New Activity in Your Projects",
          html: expect.any(String), // Already tested above
        });
      }
    );
  });
  it("sends an email with notifications grouped by project for multiple notifications", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        const { req, config, mailer } = setupEmailTest();

        // user 0 comment
        const user0comment = await userDbs[0]().postRootCommentInProject(
          { projectId: project.id },
          {
            body: "comment text",
            location: { subject: { uuid: "", iid: "" }, variants: [] },
            commentId: uuid.v4() as CommentId,
            commentThreadId: uuid.v4() as CommentThreadId,
          }
        );

        // User 1 comment
        const user1Comment = await userDbs[1]().postRootCommentInProject(
          { projectId: project.id },
          {
            body: "comment text",
            location: { subject: { uuid: "", iid: "" }, variants: [] },
            commentId: uuid.v4() as CommentId,
            commentThreadId: uuid.v4() as CommentThreadId,
          }
        ); // User 1 reply to user 0 comment
        const user0CommentReaction = await userDbs[0]().addCommentReaction(
          uuid.v4() as CommentReactionId,
          user1Comment.id,
          {
            emojiName: "1f44d",
          }
        );

        const user0CommentThreadHistory =
          await userDbs[0]().resolveThreadInProject(
            uuid.v4() as ThreadHistoryId,
            user0comment.commentThreadId,
            true
          );

        const user0ReactionOnUser1Comment =
          await userDbs[0]().addCommentReaction(
            uuid.v4() as CommentReactionId,
            user1Comment.id,
            {
              emojiName: "1f44d",
            }
          );

        // Mock input
        const notifications: Map<
          ProjectId,
          Map<CommentThreadId, Notification[]>
        > = new Map<ProjectId, Map<CommentThreadId, Notification[]>>([
          [
            project.id,
            new Map([
              [
                user0comment.commentThreadId,
                [
                  await createNotification(
                    user0comment.commentThreadId,
                    users[1],
                    project,
                    user0comment.createdAt,
                    { type: "COMMENT", comment: user0comment },
                    sudo
                  ),
                  await createNotification(
                    user0comment.commentThreadId,
                    users[1],
                    project,
                    user0CommentThreadHistory.createdAt,
                    {
                      type: "THREAD_HISTORY",
                      history: user0CommentThreadHistory,
                    },
                    sudo
                  ),
                ],
              ],
              [
                user1Comment.commentThreadId,
                [
                  await createNotification(
                    user1Comment.commentThreadId,
                    users[1],
                    project,
                    user0ReactionOnUser1Comment.createdAt,
                    { type: "REACTION", reaction: user0ReactionOnUser1Comment },
                    sudo
                  ),
                ],
              ],
            ]),
          ],
        ]);

        const expectedEmailBody = normalizeHtml(
          `<p> You have new activity in your projects:</p> <div><h2>New updates in project: <a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${
            project.name
          }</a></h2><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${user0comment.body}</a> by <strong>${fullName(
            users[0]
          )}</strong></p><ul><li><p>Thread was resolved by <strong>${fullName(
            users[0]
          )}</strong></p></li></ul><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">comment text</a> by <strong>${fullName(
            users[1]
          )}</strong></p><ul><li><p><strong>${fullName(
            users[0]
          )}</strong> reacted to your comment</p></li></ul></div> <p>If you wish  to modify your notification settings, please visit the appropriate section in Plasmic Studio.</p>`
        );

        await sendUserNotificationEmail(
          mailer,
          notifications,
          req.config.host,
          config.mailFrom,
          req.config.mailBcc // Optional BCC
        );

        // Get the actual email body sent
        const receivedHtml = normalizeHtml(
          mailer.sendMail.mock.calls[0][0].html
        );

        // Assert that the normalized HTML matches
        expect(receivedHtml).toBe(expectedEmailBody);

        // Assert other email properties
        expect(mailer.sendMail).toHaveBeenCalledWith({
          from: config.mailFrom,
          to: users[1].email,
          bcc: req.config.mailBcc,
          subject: "New Activity in Your Projects",
          html: expect.any(String), // Already tested above
        });
      }
    );
  });
  it("sends an email with notifications grouped by project for multiple notifications in multiple projects", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        const { req, config, mailer } = setupEmailTest();

        const { workspace } = await getTeamAndWorkspace(userDbs[0]());
        const { project: project2 } = await userDbs[0]().createProject({
          name: `My project 2`,
          workspaceId: workspace.id,
        });

        // user 0 comment
        const user0comment = await userDbs[0]().postRootCommentInProject(
          { projectId: project.id },
          {
            body: "comment text",
            location: { subject: { uuid: "", iid: "" }, variants: [] },
            commentId: uuid.v4() as CommentId,
            commentThreadId: uuid.v4() as CommentThreadId,
          }
        );

        // user 0 comment in project 2
        const user0commentInProject2 =
          await userDbs[0]().postRootCommentInProject(
            { projectId: project2.id },
            {
              body: "comment text",
              location: { subject: { uuid: "", iid: "" }, variants: [] },
              commentId: uuid.v4() as CommentId,
              commentThreadId: uuid.v4() as CommentThreadId,
            }
          );

        // User 1 comment
        const user1Comment = await userDbs[1]().postRootCommentInProject(
          { projectId: project.id },
          {
            body: "comment text",
            location: { subject: { uuid: "", iid: "" }, variants: [] },
            commentId: uuid.v4() as CommentId,
            commentThreadId: uuid.v4() as CommentThreadId,
          }
        );

        const user0CommentReaction = await userDbs[0]().addCommentReaction(
          uuid.v4() as CommentReactionId,
          user1Comment.id,
          {
            emojiName: "1f44d",
          }
        );

        const user0CommentThreadHistory =
          await userDbs[0]().resolveThreadInProject(
            uuid.v4() as ThreadHistoryId,
            user0comment.commentThreadId,
            true
          );

        const user0ReactionOnUser1Comment =
          await userDbs[0]().addCommentReaction(
            uuid.v4() as CommentReactionId,
            user1Comment.id,
            {
              emojiName: "1f44d",
            }
          );

        // Mock input
        const notifications: Map<
          ProjectId,
          Map<CommentThreadId, Notification[]>
        > = new Map<ProjectId, Map<CommentThreadId, Notification[]>>([
          [
            project.id,
            new Map([
              [
                user0comment.commentThreadId,
                [
                  await createNotification(
                    user0comment.commentThreadId,
                    users[1],
                    project,
                    user0comment.createdAt,
                    { type: "COMMENT", comment: user0comment },
                    sudo
                  ),
                  await createNotification(
                    user0comment.commentThreadId,
                    users[1],
                    project,
                    user0CommentThreadHistory.createdAt,
                    {
                      type: "THREAD_HISTORY",
                      history: user0CommentThreadHistory,
                    },
                    sudo
                  ),
                ],
              ],
              [
                user1Comment.commentThreadId,
                [
                  await createNotification(
                    user1Comment.commentThreadId,
                    users[1],
                    project,
                    user0ReactionOnUser1Comment.createdAt,
                    { type: "REACTION", reaction: user0ReactionOnUser1Comment },
                    sudo
                  ),
                ],
              ],
            ]),
          ],
          [
            project2.id,
            new Map([
              [
                user0commentInProject2.commentThreadId,
                [
                  await createNotification(
                    user0commentInProject2.commentThreadId,
                    users[1],
                    project2,
                    user0commentInProject2.createdAt,
                    { type: "COMMENT", comment: user0commentInProject2 },
                    sudo
                  ),
                ],
              ],
            ]),
          ],
        ]);

        const expectedEmailBody = normalizeHtml(
          `<p> You have new activity in your projects:</p> <div><h2>New updates in project: <a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${
            project.name
          }</a></h2><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">comment text</a> by <strong>${fullName(
            users[0]
          )}</strong></p><ul><li><p>Thread was resolved by <strong>${fullName(
            users[0]
          )}</strong></p></li></ul><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">comment text</a> by <strong>${fullName(
            users[1]
          )}</strong></p><ul><li><p><strong>${fullName(
            users[0]
          )}</strong> reacted to your comment</p></li></ul></div><div><h2>New updates in project: <a href="https://studio.plasmic.app/projects/${
            project2.id
          }" target="_blank">${
            project2.name
          }</a></h2><hr><p><a href="https://studio.plasmic.app/projects/${
            project2.id
          }" target="_blank">comment text</a> by <strong>${fullName(
            users[0]
          )}</strong></p></div> <p>If you wish to modify your notification settings, please visit the appropriate section in Plasmic Studio.</p>`
        );

        await sendUserNotificationEmail(
          mailer,
          notifications,
          req.config.host,
          config.mailFrom,
          req.config.mailBcc // Optional BCC
        );

        // Get the actual email body sent
        const receivedHtml = normalizeHtml(
          mailer.sendMail.mock.calls[0][0].html
        );

        // Assert that the normalized HTML matches
        expect(receivedHtml).toBe(expectedEmailBody);

        // Assert other email properties
        expect(mailer.sendMail).toHaveBeenCalledWith({
          from: config.mailFrom,
          to: users[1].email,
          bcc: req.config.mailBcc,
          subject: "New Activity in Your Projects",
          html: expect.any(String), // Already tested above
        });
      }
    );
  });
  it("sends an email with notifications grouped by project for multiple notifications in multiple branches", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs, branch }) => {
        const { req, config, mailer } = setupEmailTest();
        const branch2 = await userDbs[0]().createBranchFromLatestPkgVersion(
          project.id,
          {
            name: `my-branch-2`,
          }
        );

        // user 0 comment in main branch
        const user0comment = await userDbs[0]().postRootCommentInProject(
          { projectId: project.id },
          {
            body: "comment text",
            location: { subject: { uuid: "", iid: "" }, variants: [] },
            commentId: uuid.v4() as CommentId,
            commentThreadId: uuid.v4() as CommentThreadId,
          }
        );

        // user 0 comment in branch 1
        const user0commentInBranch1 =
          await userDbs[0]().postRootCommentInProject(
            { projectId: project.id, branchId: branch.id },
            {
              body: "comment text",
              location: { subject: { uuid: "", iid: "" }, variants: [] },
              commentId: uuid.v4() as CommentId,
              commentThreadId: uuid.v4() as CommentThreadId,
            }
          );

        // user 0 comment in branch 2
        const user0commentInBranch2 =
          await userDbs[0]().postRootCommentInProject(
            { projectId: project.id, branchId: branch2.id },
            {
              body: "comment text",
              location: { subject: { uuid: "", iid: "" }, variants: [] },
              commentId: uuid.v4() as CommentId,
              commentThreadId: uuid.v4() as CommentThreadId,
            }
          );

        // Mock input
        const notifications: Map<
          ProjectId,
          Map<CommentThreadId, Notification[]>
        > = new Map<ProjectId, Map<CommentThreadId, Notification[]>>([
          [
            project.id,
            new Map([
              [
                user0comment.commentThreadId,
                [
                  await createNotification(
                    user0comment.commentThreadId,
                    users[1],
                    project,
                    user0comment.createdAt,
                    { type: "COMMENT", comment: user0comment },
                    sudo
                  ),
                ],
              ],
              [
                user0commentInBranch1.commentThreadId,
                [
                  await createNotification(
                    user0commentInBranch1.commentThreadId,
                    users[1],
                    project,
                    user0commentInBranch1.createdAt,
                    { type: "COMMENT", comment: user0commentInBranch1 },
                    sudo
                  ),
                ],
              ],
              [
                user0commentInBranch2.commentThreadId,
                [
                  await createNotification(
                    user0commentInBranch2.commentThreadId,
                    users[1],
                    project,
                    user0commentInBranch2.createdAt,
                    { type: "COMMENT", comment: user0commentInBranch2 },
                    sudo
                  ),
                ],
              ],
            ]),
          ],
        ]);

        const expectedEmailBody = normalizeHtml(
          `<p> You have new activity in your projects:</p> <div><h2>New updates in project: <a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${
            project.name
          }</a></h2><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }" target="_blank">${user0comment.body}</a> by <strong>${fullName(
            users[0]
          )}</strong></p><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }?branch=${branch.name}" target="_blank">${
            user0commentInBranch1.body
          }</a> by <strong>${fullName(
            users[0]
          )}</strong></p><hr><p><a href="https://studio.plasmic.app/projects/${
            project.id
          }?branch=${branch2.name}" target="_blank">${
            user0commentInBranch2.body
          }</a> by <strong>${fullName(
            users[0]
          )}</strong></p></div> <p>If you wish to modify your notification settings, please visit the appropriate section in Plasmic Studio.</p>`
        );

        await sendUserNotificationEmail(
          mailer,
          notifications,
          req.config.host,
          config.mailFrom,
          req.config.mailBcc // Optional BCC
        );

        // Get the actual email body sent
        const receivedHtml = normalizeHtml(
          mailer.sendMail.mock.calls[0][0].html
        );

        // Assert that the normalized HTML matches
        expect(receivedHtml).toBe(expectedEmailBody);

        // Assert other email properties
        expect(mailer.sendMail).toHaveBeenCalledWith({
          from: config.mailFrom,
          to: users[1].email,
          bcc: req.config.mailBcc,
          subject: "New Activity in Your Projects",
          html: expect.any(String), // Already tested above
        });
      }
    );
  });
});
