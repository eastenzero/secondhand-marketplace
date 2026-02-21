import { useEffect, useState, useCallback } from 'react';
import { Palette, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { systemService } from '@/services/system';
import { toast } from 'sonner';

interface ImageStyleToggleProps {
    /** Called after the style changes so parent can refresh data */
    onStyleChange?: (newStyle: 'cartoon' | 'photo') => void;
}

export function ImageStyleToggle({ onStyleChange }: ImageStyleToggleProps) {
    const [style, setStyle] = useState<'cartoon' | 'photo'>('photo');
    const [loading, setLoading] = useState(false);

    const fetchStyle = useCallback(async () => {
        try {
            const res = await systemService.getImageStyle();
            setStyle(res.style);
        } catch {
            // silently default to cartoon
        }
    }, []);

    useEffect(() => {
        fetchStyle();
    }, [fetchStyle]);

    const toggleStyle = async () => {
        const next = style === 'cartoon' ? 'photo' : 'cartoon';
        setLoading(true);
        try {
            const res = await systemService.setImageStyle(next);
            setStyle(res.style);
            toast.success(`图片风格已切换为 ${res.style === 'cartoon' ? '🎨 卡通' : '📷 照片'}`);
            onStyleChange?.(res.style);
        } catch {
            toast.error('切换图片风格失败');
        } finally {
            setLoading(false);
        }
    };

    const isCartoon = style === 'cartoon';

    return (
        <div className="inline-flex items-center gap-2">
            <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 transition-colors ${isCartoon
                    ? 'border-purple-400/50 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : 'border-emerald-400/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
            >
                {isCartoon ? '🎨 卡通模式' : '📷 照片模式'}
            </Badge>
            <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={toggleStyle}
                className="h-8 gap-1.5 text-xs rounded-full transition-all hover:shadow-sm"
            >
                {loading ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isCartoon ? (
                    <Camera className="h-3.5 w-3.5" />
                ) : (
                    <Palette className="h-3.5 w-3.5" />
                )}
                切换至{isCartoon ? '照片' : '卡通'}
            </Button>
        </div>
    );
}
