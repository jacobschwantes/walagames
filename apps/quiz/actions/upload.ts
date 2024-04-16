"use server";

const sharp = require("sharp");

type UploadResponse = { src: string } | { error: string };

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
  try {
    const imageFile = formData.get("file");
    if (!imageFile) {
      return { error: "No file received" };
    }

    // @ts-expect-error
    // Convert to array buffer so sharp can read it
    const buffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Compress the image
    const compressedBuffer = await sharp(imageBuffer)
      .webp({ quality: 80 })
      .resize({ width: 1200 })
      .toBuffer();

    // Convert back to FormData file for upload
    const compressedBlob = new Blob([compressedBuffer], { type: "image/webp" });
    const newFormData = new FormData();
    newFormData.append("file", compressedBlob, "image.webp");

    // Upload
    const response = await fetch(`${process.env.ZIPLINE_API_ENDPOINT}/upload`, {
      method: "POST",
      headers: {
        Format: "UUID",
        "X-Zipline-Folder": "1",
        Authorization: `${process.env.ZIPLINE_ACCESS_TOKEN}`,
      },
      body: newFormData,
    });
    if (!response.ok) {
      const resText = await response.text();
      throw new Error(resText || "Unknown error");
    }
    
    const data = await response.json();
    return {
      src: data.files[0],
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
