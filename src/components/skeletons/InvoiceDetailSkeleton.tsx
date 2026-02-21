import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const InvoiceDetailSkeleton: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <div className="flex justify-content-between align-items-start mb-4">
                <div>
                    <Skeleton width="5rem" height="1.5rem" className="mb-2" />
                    <Skeleton width="12rem" height="2rem" className="mb-2" />
                    <Skeleton width="5rem" height="1.75rem" borderRadius="6px" />
                </div>
                <div className="flex gap-2">
                    <Skeleton width="9rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="6rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                </div>
            </div>

            <div className="grid">
                {/* Invoice Info — 8 cols */}
                <div className="col-12 lg:col-8">
                    <Card className="shadow-2 mb-4">
                        {/* Billed to + Dates */}
                        <div className="flex justify-content-between mb-4">
                            <div className="flex flex-column gap-2">
                                <Skeleton width="6rem" height="1.25rem" />
                                <Skeleton width="10rem" height="1rem" />
                                <Skeleton width="8rem" height="0.85rem" />
                                <Skeleton width="7rem" height="0.85rem" />
                            </div>
                            <div className="flex flex-column gap-2 align-items-end">
                                <Skeleton width="10rem" height="1rem" />
                                <Skeleton width="10rem" height="1rem" />
                            </div>
                        </div>

                        {/* Table skeleton */}
                        <div className="mb-4">
                            <div className="flex p-3 surface-100 border-round-top">
                                {['40%', '15%', '20%', '15%'].map((w, i) => (
                                    <div key={i} className="px-2" style={{ width: w }}>
                                        <Skeleton width="80%" height="1rem" />
                                    </div>
                                ))}
                            </div>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex p-3" style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                    {['40%', '15%', '20%', '15%'].map((w, j) => (
                                        <div key={j} className="px-2" style={{ width: w }}>
                                            <Skeleton width="70%" height="1rem" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="flex justify-content-end">
                            <div style={{ width: '15rem' }} className="flex flex-column gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex justify-content-between">
                                        <Skeleton width="5rem" height="1rem" />
                                        <Skeleton width="5rem" height="1rem" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Payments — 4 cols */}
                <div className="col-12 lg:col-4">
                    <Card className="shadow-2">
                        <Skeleton width="6rem" height="1.25rem" className="mb-3" />
                        <div className="flex flex-column gap-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="p-3 surface-100 border-round">
                                    <div className="flex justify-content-between align-items-center mb-2">
                                        <Skeleton width="5rem" height="1rem" />
                                        <Skeleton width="4rem" height="1.5rem" borderRadius="6px" />
                                    </div>
                                    <Skeleton width="8rem" height="0.75rem" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailSkeleton;
