"use server";
const sharp = require("sharp");
const { Readable } = require("stream");
export async function uploadImage(formData: FormData) {
  console.log("Uploading image in action");
  const imageFile = formData.get("file");

  // Convert the File object to a Buffer
  const buffer = await imageFile.arrayBuffer();
  const imageBuffer = Buffer.from(buffer);

  // Compress the image using sharp
  const compressedBuffer = await sharp(imageBuffer) // Optional: Resize the image
      .webp({ quality: 80 })
      .resize({ width: 1200 })
    .toBuffer();

  // Convert the compressed buffer to a Blob
  const compressedBlob = new Blob([compressedBuffer], { type: "image/webp" });

  // Create a new FormData and append the compressed image Blob
  const newFormData = new FormData();
  newFormData.append("file", compressedBlob, "image.webp");
  const response = await fetch(`${process.env.ZIPLINE_API_ENDPOINT}/upload`, {
    method: "POST",
    headers: {
      Format: "UUID",
      "X-Zipline-Folder": "1",
      //   "Image-Compression-Percent": "50",
      Authorization: `${process.env.ZIPLINE_ACCESS_TOKEN}`,
    },
    body: newFormData,
  });
  if (!response.ok) {
    const resText = await response.text();
    console.log(resText);
    throw new Error(resText || "Unknown error");
  }
  const data = await response.json();

  console.log(data);
  return data;
}
