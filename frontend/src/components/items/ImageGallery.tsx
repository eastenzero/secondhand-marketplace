import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                No Image Available
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted relative group">
                <img
                    src={images[selectedIndex]}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={cn(
                                "relative flex-none cursor-pointer overflow-hidden rounded-md border-2 transition-all hover:border-primary w-20 h-20",
                                selectedIndex === index ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"
                            )}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <img
                                src={image}
                                alt={`${title} ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
