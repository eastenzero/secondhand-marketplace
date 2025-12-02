import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FilterParams {
    keyword?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
}

interface ItemFiltersProps {
    onSearch: (params: FilterParams) => void;
}

export function ItemFilters({ onSearch }: ItemFiltersProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Local state for inputs to allow debouncing/submit-based search
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    // Sync local state with URL params on mount/update
    useEffect(() => {
        setKeyword(searchParams.get('keyword') || '');
        setCategory(searchParams.get('category') || 'all');
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
    }, [searchParams]);

    const handleSearch = () => {
        const params: FilterParams = {};
        if (keyword) params.keyword = keyword;
        if (category && category !== 'all') params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        // Reset to page 1 on new search
        params.page = '1';

        // Remove undefined values
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v != null)
        ) as Record<string, string>;

        setSearchParams(cleanParams);
        onSearch(params);
    };

    const handleReset = () => {
        setKeyword('');
        setCategory('all');
        setMinPrice('');
        setMaxPrice('');
        setSearchParams({});
        onSearch({});
    };

    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                    <Label>关键词</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="搜索商品..."
                            className="pl-9"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </div>

                <div className="w-full md:w-[200px] space-y-2">
                    <Label>分类</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="全部分类" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部分类</SelectItem>
                            <SelectItem value="electronics">数码产品</SelectItem>
                            <SelectItem value="books">书籍教材</SelectItem>
                            <SelectItem value="clothing">衣物服饰</SelectItem>
                            <SelectItem value="furniture">生活家具</SelectItem>
                            <SelectItem value="others">其他</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="space-y-2 w-24">
                        <Label>最低价</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 w-24">
                        <Label>最高价</Label>
                        <Input
                            type="number"
                            placeholder="∞"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleSearch}>搜索</Button>
                    <Button variant="outline" onClick={handleReset}>重置</Button>
                </div>
            </div>
        </div>
    );
}
