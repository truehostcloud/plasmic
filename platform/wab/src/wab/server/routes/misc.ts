import "@/wab/server/extensions";
import { userAnalytics } from "@/wab/server/routes/util";
import { GetClipResponse } from "@/wab/shared/ApiSchema";
import { ensureInstance, ensureType } from "@/wab/shared/common";
import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Request, Response } from "express-serve-static-core";

export async function getAppConfig(req: Request, res: Response) {
  const config = req.devflags;
  res.json({ config });
}

export async function putClip(req: Request, res: Response) {
  const { clipId } = req.params;
  const s3 = new S3({
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
  await new Upload({
    client: s3,
    params: { Bucket: "plasmic-clips", Key: clipId, Body: req.body.content },
  }).done();
  userAnalytics(req).track({
    event: "Figma put clip",
    properties: { size: req.body.content.length },
  });
  res.json({});
}

export async function getClip(req: Request, res: Response) {
  const { clipId } = req.params;
  const s3 = new S3({
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
  const result = await s3.getObject({
    Bucket: "plasmic-clips",
    Key: clipId,
  });
  const bodyBuffer = await streamToBuffer(result.Body as NodeJS.ReadableStream);
  const content = ensureInstance(bodyBuffer, Buffer).toString("utf8");
  userAnalytics(req).track({
    event: "Figma get clip",
    properties: { size: content.length },
  });
  res.json(ensureType<GetClipResponse>({ content }));
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
