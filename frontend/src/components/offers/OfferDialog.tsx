import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { offersService } from '@/services/offers';
import { useAuthStore } from '@/stores/useAuthStore';
import { ApiErrorResponse } from '@/types/api';

const offerSchema = z.object({
    amount: z.coerce.number().min(0.01, '报价金额必须大于 0'),
    message: z.string().max(500, '留言最多 500 个字符').optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface OfferDialogProps {
    targetType: 'item' | 'demand';
    targetId: string;
    targetTitle: string;
    targetOwnerId: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function OfferDialog({
    targetType,
    targetId,
    targetTitle,
    targetOwnerId,
    trigger,
    onSuccess
}: OfferDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    const isOwner = user?.id === targetOwnerId;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<OfferFormValues>({
        resolver: zodResolver(offerSchema),
    });

    const onSubmit = async (data: OfferFormValues) => {
        if (!isAuthenticated) {
            toast.error('请先登录');
            return;
        }

        setIsLoading(true);
        try {
            await offersService.createOffer({
                targetType,
                targetId,
                amount: data.amount,
                message: data.message,
            });

            toast.success('报价已发送');
            setOpen(false);
            reset();
            onSuccess?.();
        } catch (error) {
            console.error('Offer failed', error);
            const err = error as ApiErrorResponse;
            const code = err.response?.data?.code;

            if (code === 'SELF_OFFER_NOT_ALLOWED') {
                toast.error('不能给自己报价');
            } else if (code === 'INVALID_AMOUNT') {
                toast.error('报价金额无效');
            } else if (code === 'TARGET_NOT_ACTIVE') {
                toast.error('该商品/需求已下架或关闭');
            } else {
                toast.error('报价失败，请稍后重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isOwner) {
        return (
            <Button disabled variant="secondary" className="w-full opacity-50 cursor-not-allowed">
                这是你发布的{targetType === 'item' ? '商品' : '需求'}
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button size="lg" className="w-full">发起报价</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>发起报价</DialogTitle>
                    <DialogDescription>
                        对 "{targetTitle}" 发起报价。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">报价金额 (¥)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('amount')}
                                disabled={isLoading}
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">{errors.amount.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">留言 (可选)</Label>
                            <Textarea
                                id="message"
                                placeholder="想对卖家/求购者说点什么..."
                                {...register('message')}
                                disabled={isLoading}
                            />
                            {errors.message && (
                                <p className="text-sm text-destructive">{errors.message.message}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? '发送中...' : '确认发送'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
