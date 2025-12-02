import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemandStore } from '@/stores/useDemandStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const publishSchema = z.object({
    title: z.string().min(1, '标题不能为空').max(100, '标题最多 100 个字符'),
    description: z.string().max(2000, '描述最多 2000 个字符'),
    minPrice: z.coerce.number().min(0, '价格必须大于等于 0'),
    maxPrice: z.coerce.number().min(0, '价格必须大于等于 0'),
    category: z.string().min(1, '请选择分类'),
    imageUrl: z.string().url('请输入有效的图片链接').optional().or(z.literal('')),
}).refine((data) => data.maxPrice >= data.minPrice, {
    message: "最高价必须大于等于最低价",
    path: ["maxPrice"],
});

type PublishFormValues = z.infer<typeof publishSchema>;

export default function PublishDemandPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const { createDemand, updateDemand, fetchDemand } = useDemandStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<PublishFormValues>({
        resolver: zodResolver(publishSchema),
        defaultValues: {
            category: 'others',
            minPrice: 0,
            maxPrice: 0,
        }
    });

    const categoryValue = watch('category');

    useEffect(() => {
        if (editId) {
            const loadDemand = async () => {
                setIsLoading(true);
                const demand = await fetchDemand(editId);
                if (demand) {
                    reset({
                        title: demand.title,
                        description: demand.description,
                        minPrice: demand.minPrice,
                        maxPrice: demand.maxPrice,
                        category: demand.category || 'others',
                        imageUrl: demand.imageUrl || '',
                    });
                } else {
                    toast.error('无法加载需求信息');
                    navigate('/me/posts');
                }
                setIsLoading(false);
            };
            loadDemand();
        }
    }, [editId, fetchDemand, reset, navigate]);

    const onSubmit = async (data: PublishFormValues) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                images: data.imageUrl ? [data.imageUrl] : [],
            };

            if (editId) {
                await updateDemand(editId, payload);
                toast.success('更新成功');
                navigate('/me/posts');
            } else {
                const newDemand = await createDemand(payload);
                if (newDemand) {
                    toast.success('发布成功');
                    navigate(`/demands/${newDemand.id}`);
                } else {
                    toast.error('发布失败，请重试');
                }
            }
        } catch (error) {
            console.error('Operation failed', error);
            toast.error(editId ? '更新失败' : '发布失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container max-w-2xl py-6">
            <Card>
                <CardHeader>
                    <CardTitle>{editId ? '编辑需求' : '发布需求'}</CardTitle>
                    <CardDescription>
                        {editId ? '修改需求信息' : '告诉大家你在寻找什么'}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">需求标题</Label>
                            <Input
                                id="title"
                                placeholder="例如：求购二手 iPad Air 5"
                                {...register('title')}
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minPrice">最低预算 (¥)</Label>
                                <Input
                                    id="minPrice"
                                    type="number"
                                    step="0.01"
                                    {...register('minPrice')}
                                    disabled={isLoading}
                                />
                                {errors.minPrice && (
                                    <p className="text-sm text-destructive">{errors.minPrice.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxPrice">最高预算 (¥)</Label>
                                <Input
                                    id="maxPrice"
                                    type="number"
                                    step="0.01"
                                    {...register('maxPrice')}
                                    disabled={isLoading}
                                />
                                {errors.maxPrice && (
                                    <p className="text-sm text-destructive">{errors.maxPrice.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>分类</Label>
                            <Select
                                value={categoryValue}
                                onValueChange={(val) => setValue('category', val)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择分类" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electronics">数码产品</SelectItem>
                                    <SelectItem value="books">书籍教材</SelectItem>
                                    <SelectItem value="clothing">衣物服饰</SelectItem>
                                    <SelectItem value="furniture">生活家具</SelectItem>
                                    <SelectItem value="others">其他</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-sm text-destructive">{errors.category.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">需求描述</Label>
                            <Textarea
                                id="description"
                                placeholder="描述你期望的商品成色、功能、配件要求等..."
                                className="min-h-[150px]"
                                {...register('description')}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">参考图片 (可选)</Label>
                            <Input
                                id="imageUrl"
                                placeholder="https://example.com/reference.jpg"
                                {...register('imageUrl')}
                                disabled={isLoading}
                            />
                            {errors.imageUrl && (
                                <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => navigate(-1)} disabled={isLoading}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? '保存中...' : (editId ? '确认修改' : '确认发布')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
