export const LEAD_URL = "https://functions.poehali.dev/007dbce2-f142-404b-9a7a-7d2b0f2f3501";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "rtf", "odt", "txt", "zip", "rar", "7z", "jpg", "jpeg", "png", "dwg"];
export const ACCEPT = ALLOWED_EXT.map((e) => "." + e).join(",");

const CHUNK = 1536 * 1024;

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

const newId = () => {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
};

export const fileExt = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");

export const uploadLeadFile = async (file: File) => {
  const uploadId = newId();
  const parts = Math.max(1, Math.ceil(file.size / CHUNK));
  for (let i = 0; i < parts; i++) {
    const data = await toBase64(file.slice(i * CHUNK, (i + 1) * CHUNK));
    const res = await fetch(LEAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upload_chunk", upload_id: uploadId, index: i, data }),
    });
    if (!res.ok) throw new Error("upload");
  }
  return { upload_id: uploadId, parts, name: file.name };
};
