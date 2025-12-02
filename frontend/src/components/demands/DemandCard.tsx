import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Demand } from '@/types/demand';

interface DemandCardProps {
    demand: Demand;
}

export function DemandCard({ demand }: DemandCardProps) {
    return (
        <Link to={`/demands/${demand.id}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md border-l-4 border-l-primary/50">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-lg">{demand.title}</CardTitle>
                        <Badge variant={demand.status === 'active' ? 'default' : 'secondary'}>
                            {demand.status === 'active' ? '求购中' : '已满足'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 py-2">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                        {demand.description}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">期望价格</span>
                        <span className="text-lg font-bold text-primary">
                            ¥{demand.minPrice} - {demand.maxPrice}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {new Date(demand.createdAt).toLocaleDateString()}
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
