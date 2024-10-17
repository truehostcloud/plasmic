import { ensureInstance, ensureType } from "@/wab/shared/common";
import "@/wab/server/extensions";
import { userAnalytics } from "@/wab/server/routes/util";
import { GetClipResponse } from "@/wab/shared/ApiSchema";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import { Request, Response } from "express-serve-static-core";

export async function getAppConfig(req: Request, res: Response) {
  const config = req.devflags;
  res.json({ config });
}

export async function putClip(req: Request, res: Response) {
  const { clipId } = req.params;
  const s3 = new S3();
  await new Upload({
    client: s3,
    params: { Bucket: "plasmic-clips", Key: clipId, Body: req.body.content },
  })
    .done();
  userAnalytics(req).track({
    event: "Figma put clip",
    properties: { size: req.body.content.length },
  });
  res.json({});
}

export async function getClip(req: Request, res: Response) {
  const { clipId } = req.params;
  const s3 = new S3();
  const result = await s3
    .getObject({
      Bucket: "plasmic-clips",
      Key: clipId,
    });
  const content = ensureInstance(result.Body, Buffer).toString("utf8");
  userAnalytics(req).track({
    event: "Figma get clip",
    properties: { size: content.length },
  });
  res.json(ensureType<GetClipResponse>({ content }));
}
