import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
    return (
        <Card className="h-full overflow-hidden">
            <div className="aspect-video w-full bg-muted">
                <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-12" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
            </CardFooter>
        </Card>
    )
}
