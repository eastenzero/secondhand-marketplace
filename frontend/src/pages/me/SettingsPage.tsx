import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Lock, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuthStore } from '@/stores/useAuthStore';

const profileSchema = z.object({
    nickname: z.string().min(2, '昵称至少 2 个字符').max(20, '昵称最多 20 个字符'),
    bio: z.string().max(200, '个性签名最多 200 个字符').optional(),
    avatar: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const { user, login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nickname: user?.name || '',
            bio: 'This user is lazy and has not written a bio yet.',
            avatar: [], // In real app, this would be initialized with user.avatarUrl
        }
    });

    const avatarValue = watch('avatar');

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update local user state
        if (user) {
            login({
                ...user,
                name: data.nickname,
            });
        }

        toast.success('个人资料已更新');
        setIsLoading(false);
    };

    return (
        <div className="container max-w-4xl py-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">个人设置</h1>
                <p className="text-muted-foreground">管理你的个人资料和账户设置</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                <nav className="flex flex-col space-y-1">
                    <Button variant="secondary" className="justify-start">
                        <User className="mr-2 h-4 w-4" />
                        个人资料
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <Lock className="mr-2 h-4 w-4" />
                        账号安全
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        消息通知
                    </Button>
                </nav>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                            <CardDescription>
                                其他用户将看到这些信息
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>头像</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24">
                                            <ImageUpload
                                                value={avatarValue || []}
                                                onChange={(val) => setValue('avatar', val)}
                                                maxFiles={1}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            支持 JPG, PNG, WebP. <br />
                                            建议尺寸 200x200px.
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nickname">昵称</Label>
                                    <Input
                                        id="nickname"
                                        {...register('nickname')}
                                        disabled={isLoading}
                                    />
                                    {errors.nickname && (
                                        <p className="text-sm text-destructive">{errors.nickname.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">个性签名</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="介绍一下你自己..."
                                        className="resize-none"
                                        {...register('bio')}
                                        disabled={isLoading}
                                    />
                                    {errors.bio && (
                                        <p className="text-sm text-destructive">{errors.bio.message}</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>保存中...</>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            保存修改
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
