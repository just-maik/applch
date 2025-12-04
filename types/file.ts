
// Supported file types
export type FileType = "pdf" | "image" | "text";
export type MimeType = "application/pdf" | "image/png" | "image/jpeg" | "image/webp";

export type FileInfo ={
    type: FileType;
    path: string;
    name: string;
    data: Buffer;
}

export type PrintResult = {
    content: string;
    filename: string;
    title: string;
}