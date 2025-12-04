import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, maxFiles = 5, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsUploading(true);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUrls = acceptedFiles.map(file => URL.createObjectURL(file));
        onChange([...value, ...newUrls].slice(0, maxFiles));
        setIsUploading(false);
    }, [value, onChange, maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        disabled: disabled || isUploading || value.length >= maxFiles,
        maxFiles: maxFiles - value.length,
    });

    const removeImage = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {value.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                        <img
                            src={url}
                            alt={`Uploaded ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {value.length < maxFiles && (
                    <div
                        {...getRootProps()}
                        className={`
                            aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <input {...getInputProps()} />
                        {isUploading ? (
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
                                <span className="text-xs text-muted-foreground">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground text-center px-2">
                                    {isDragActive ? 'Drop here' : 'Upload Image'}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                支持 JPG, PNG, WebP. 最多 {maxFiles} 张图片.
            </p>
        </div>
    );
}
