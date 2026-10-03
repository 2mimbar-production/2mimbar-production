import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const FIELD_CLASS =
  "w-full rounded border border-line-strong bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-paper";

// Safari iPad memberi input tanggal lebar minimum & latar abu-abu bawaan,
// sehingga kolomnya meluber keluar grid. appearance-none mengembalikannya
// ke gaya field biasa; picker tanggal tetap muncul saat diketuk.
const TANGGAL_CLASS =
  "min-w-0 appearance-none min-h-[38px] text-left [&::-webkit-date-and-time-value]:text-left";

export function Input({ className = "", type, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const tanggal = type === "date" || type === "month" || type === "time";
  return <input type={type} className={`${FIELD_CLASS} ${tanggal ? TANGGAL_CLASS : ""} ${className}`} {...rest} />;
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLASS} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${FIELD_CLASS} ${className}`} {...rest}>
      {children}
    </select>
  );
}
