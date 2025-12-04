import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item, ItemStatus } from '@/types/item';

interface ItemCardProps {
    item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
    return (
        <Link to={`/items/${item.id}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video w-full bg-muted object-cover">
                    {/* Placeholder for image */}
                    {(item.imageUrl || (item.images && item.images.length > 0)) ? (
                        <img
                            src={item.imageUrl || item.images?.[0]}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>
                <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-lg">{item.title}</CardTitle>
                        <Badge variant={item.status === ItemStatus.ACTIVE ? 'default' : 'secondary'}>
                            {item.status === ItemStatus.ACTIVE ? '在售' : '其他'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <span className="text-lg font-bold">¥{item.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
