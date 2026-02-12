import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "crypto";
import { minioClient, publicBucket, minioUrl } from ".";

export const hash = (password: string) => {
  const salt = randomBytes(16).toString("hex");

  return new Promise<string>((resolved, rejected) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        rejected(err);
      }

      resolved(salt + ":" + (derivedKey as Buffer).toString("hex"));
    });
  });
};

export const verify = async (password: string, hash: string) => {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");

  return new Promise<boolean>((resolved, rejected) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        rejected(err);
      }

      resolved(timingSafeEqual(keyBuffer, derivedKey as Buffer));
    });
  });
};

export const formDataToObject = (formData: FormData) => {
  const obj: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (obj[key] !== undefined) {
      // Merge repeated keys into arrays
      obj[key] = Array.isArray(obj[key])
        ? [...obj[key], value]
        : [obj[key], value];
    } else {
      obj[key] = value;
    }
  }

  return obj;
};

export type MinioObject = { url: string; name: string };

export const uploadFileToMinio = async (file: File): Promise<MinioObject> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uuid = randomUUID();
  await minioClient.putObject(publicBucket, uuid, buffer, file.size, {
    "content-type": file.type,
  });

  return { url: `${minioUrl}/${publicBucket}/${uuid}`, name: uuid };
};

export const deleteFileFromMinio = async (name: string) => {
  minioClient.removeObject(publicBucket, name);
};

// Maybe replace this method with a zod fileSchema with .refine
export const validateFile = (file: File) => {
  if (!allowedFileTypes.includes(file.type)) {
    throw new Error("Uploaded file is not a supported type");
  }

  if (file.size > maxFileSize) {
    throw new Error("Uploaded file is larger than 30MB");
  }
};

const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];
// Max file size is 30MB;
const maxFileSize = 30000000;
