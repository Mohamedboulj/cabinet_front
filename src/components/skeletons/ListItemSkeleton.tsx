import { Skeleton } from 'primereact/skeleton';

interface ListItemSkeletonProps {
    count?: number;
}

const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({ count = 3 }) => {
    return (
        <div className="flex flex-column gap-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex justify-content-between align-items-center p-2 border-round"
                >
                    <div className="flex flex-column gap-2" style={{ flex: 1 }}>
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                    <div className="flex align-items-center gap-2">
                        <Skeleton width="4rem" height="1.5rem" borderRadius="6px" />
                        <Skeleton width="1rem" height="1rem" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListItemSkeleton;
