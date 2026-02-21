import { Skeleton } from 'primereact/skeleton';

interface DataTableSkeletonProps {
    headers: string[];
    rows?: number;
}

const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({ headers, rows = 5 }) => {
    return (
        <div className="shadow-2 border-round surface-card">
            {/* Header row — real column names */}
            <div className="flex p-3 surface-100 border-round-top">
                {headers.map((header, i) => (
                    <div key={`header-${i}`} className="flex-1 px-2">
                        <span className="text-sm font-semibold text-600">{header}</span>
                    </div>
                ))}
            </div>

            {/* Body rows — skeleton placeholders */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={`row-${rowIdx}`}
                    className="flex p-3 align-items-center"
                    style={{ borderBottom: '1px solid var(--surface-200)' }}
                >
                    {headers.map((_, colIdx) => (
                        <div key={`cell-${rowIdx}-${colIdx}`} className="flex-1 px-2">
                            <Skeleton width={colIdx === 0 ? '40%' : '80%'} height="1rem" />
                        </div>
                    ))}
                </div>
            ))}

            {/* Paginator skeleton */}
            <div className="flex justify-content-between align-items-center p-3">
                <Skeleton width="8rem" height="1rem" />
                <div className="flex gap-2">
                    <Skeleton width="2rem" height="2rem" borderRadius="4px" />
                    <Skeleton width="2rem" height="2rem" borderRadius="4px" />
                    <Skeleton width="2rem" height="2rem" borderRadius="4px" />
                </div>
            </div>
        </div>
    );
};

export default DataTableSkeleton;
