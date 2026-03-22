/**
 * Cloudinary server-side helpers
 * Uses cloudinary Node.js SDK for uploads
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dkfbkya8e";
const FOLDER = "dcfilms";

/**
 * Upload an image from a URL to Cloudinary.
 * Uses public_id for deduplication — same ID won't upload twice.
 * Returns the permanent Cloudinary HTTPS URL.
 */
export async function uploadFromUrl(sourceUrl: string, publicId: string): Promise<string> {
  const safeId = publicId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

  try {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder: FOLDER,
      public_id: safeId,
      overwrite: false,      // skip if already exists
      resource_type: "image",
    });
    return result.secure_url;
  } catch (err: unknown) {
    // If image already exists Cloudinary throws — return the existing URL
    const msg = (err as Error).message ?? "";
    if (msg.includes("already exists")) {
      return cldUrl(safeId);
    }
    throw err;
  }
}

/**
 * Build a Cloudinary URL from a public_id (no upload needed).
 * Also accepts a full https://res.cloudinary.com URL and returns it as-is.
 */
export function cldUrl(publicIdOrUrl: string): string {
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${FOLDER}/${publicIdOrUrl}`;
}

/**
 * Returns true if a URL is already hosted on Cloudinary.
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}
