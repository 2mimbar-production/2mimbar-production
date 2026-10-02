import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const FIELD_CLASS =
  "w-full rounded-lg border border-denim-100 px-3 py-2 text-sm outline-none focus:border-denim-500";

// Safari iPad memberi input tanggal lebar minimum & latar abu-abu bawaan,
// sehingga kolomnya meluber keluar grid. appearance-none mengembalikannya
// ke gaya field biasa; picker tanggal tetap muncul saat diketuk.
const TANGGAL_CLASS =
  "min-w-0 appearance-none bg-white min-h-[38px] text-left [&::-webkit-date-and-time-value]:text-left";

export function Input({ className = "", type, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const tanggal = type === "date" || type === "month" || type === "time";
  return <input type={type} className={`${FIELD_CLASS} ${tanggal ? TANGGAL_CLASS : ""} ${className}`} {...rest} />;
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLASS} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${FIELD_CLASS} bg-white ${className}`} {...rest}>
      {children}
    </select>
  );
}
