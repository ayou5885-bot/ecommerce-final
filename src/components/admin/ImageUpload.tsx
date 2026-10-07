import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/upload';
import { Upload, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  aspect?: string;
}

export function ImageUpload({ value, onChange, folder, label, aspect = 'aspect-square' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, folder);
    if (url) onChange(url);
    setUploading(false);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <div
        className={`relative ${aspect} w-full max-w-[200px] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium flex items-center gap-1">
                <Upload size={14} /> Change
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            <span className="text-xs mt-2">{uploading ? 'Uploading...' : 'Click to upload'}</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
