import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const ActivityHistorySkeleton: React.FC = () => (
    <Card className="shadow-2">
        {Array.from({ length: 3 }).map((_, groupIdx) => (
            <div key={groupIdx} className="mb-4">
                {/* Date header skeleton */}
                <div className="flex align-items-center gap-3 mb-3">
                    <Skeleton width="8rem" height="1.2rem" />
                    <Skeleton width="100%" height="1px" />
                </div>
                {/* Entry skeletons */}
                {Array.from({ length: 2 }).map((_, entryIdx) => (
                    <div key={entryIdx} className="ml-3 mb-3 pb-3 border-bottom-1 surface-border">
                        <div className="flex align-items-center gap-2 mb-2">
                            <Skeleton width="6rem" height="1.5rem" borderRadius="6px" />
                            <Skeleton width="14rem" height="1rem" />
                        </div>
                        <div className="ml-2 mt-2 flex flex-column gap-1">
                            <Skeleton width="70%" height="0.9rem" />
                            <Skeleton width="50%" height="0.9rem" />
                        </div>
                    </div>
                ))}
            </div>
        ))}
    </Card>
);

export default ActivityHistorySkeleton;
