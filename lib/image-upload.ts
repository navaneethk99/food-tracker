import sharp from "sharp";

function isHeicFile(file: File) {
  return file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}

function replaceExtension(fileName: string, extension: string) {
  return fileName.replace(/\.[^.]+$/, extension);
}

export async function normalizeMealImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isHeicFile(file)) {
    return {
      buffer,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
    };
  }

  const convertedBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();

  return {
    buffer: convertedBuffer,
    fileName: file.name.includes(".") ? replaceExtension(file.name, ".jpg") : `${file.name}.jpg`,
    mimeType: "image/jpeg",
  };
}
