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
import { useItemStore } from '@/stores/useItemStore';
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
    price: z.coerce.number().min(0.01, '价格必须大于 0'),
    category: z.string().min(1, '请选择分类'),
    imageUrl: z.string().url('请输入有效的图片链接').optional().or(z.literal('')),
});

type PublishFormValues = z.infer<typeof publishSchema>;

export default function PublishItemPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const { createItem, updateItem, fetchItem } = useItemStore();
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
            price: 0,
        }
    });

    const categoryValue = watch('category');

    useEffect(() => {
        if (editId) {
            const loadItem = async () => {
                setIsLoading(true);
                const item = await fetchItem(editId);
                if (item) {
                    reset({
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        category: item.category || 'others',
                        imageUrl: item.images?.[0] || '',
                    });
                } else {
                    toast.error('无法加载商品信息');
                    navigate('/me/posts');
                }
                setIsLoading(false);
            };
            loadItem();
        }
    }, [editId, fetchItem, reset, navigate]);

    const onSubmit = async (data: PublishFormValues) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                images: data.imageUrl ? [data.imageUrl] : [],
            };

            if (editId) {
                await updateItem(editId, payload);
                toast.success('更新成功');
                navigate('/me/posts');
            } else {
                const newItem = await createItem(payload);
                if (newItem) {
                    toast.success('发布成功');
                    navigate(`/items/${newItem.id}`);
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
                    <CardTitle>{editId ? '编辑商品' : '发布闲置'}</CardTitle>
                    <CardDescription>
                        {editId ? '修改商品信息' : '填写商品信息，让更多人看到'}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">商品标题</Label>
                            <Input
                                id="title"
                                placeholder="例如：99新 iPhone 15 Pro Max 256G"
                                {...register('title')}
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">价格 (¥)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('price')}
                                disabled={isLoading}
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price.message}</p>
                            )}
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
                            <Label htmlFor="description">商品描述</Label>
                            <Textarea
                                id="description"
                                placeholder="描述商品的成色、购买渠道、使用情况等..."
                                className="min-h-[150px]"
                                {...register('description')}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">图片链接 (可选)</Label>
                            <Input
                                id="imageUrl"
                                placeholder="https://example.com/image.jpg"
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
