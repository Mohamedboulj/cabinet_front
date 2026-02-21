import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const StatCardSkeleton: React.FC = () => (
    <Card className="shadow-2">
        <div className="flex justify-content-between align-items-start">
            <div className="flex flex-column gap-2" style={{ flex: 1 }}>
                <Skeleton width="60%" height="0.85rem" />
                <Skeleton width="40%" height="2rem" />
                <Skeleton width="50%" height="0.75rem" />
            </div>
            <Skeleton shape="circle" size="3rem" />
        </div>
    </Card>
);

const DashboardSkeleton: React.FC = () => {
    return (
        <div>
            {/* Title */}
            <div className="flex justify-content-between align-items-center mb-4">
                <Skeleton width="14rem" height="2rem" />
                <Skeleton shape="circle" size="2.5rem" />
            </div>

            {/* Stats Grid */}
            <div className="grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="col-12 md:col-6 lg:col-3">
                        <StatCardSkeleton />
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-5">
                <Skeleton width="10rem" height="1.25rem" className="mb-3" />
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} width="10rem" height="2.5rem" borderRadius="6px" />
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid mt-5">
                <div className="col-12 lg:col-6">
                    <Card title="" className="shadow-2 h-full">
                        <Skeleton width="12rem" height="1.25rem" className="mb-3" />
                        <div className="flex flex-column gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex justify-content-between align-items-center p-2">
                                    <div className="flex flex-column gap-2" style={{ flex: 1 }}>
                                        <Skeleton width="60%" height="1rem" />
                                        <Skeleton width="40%" height="0.75rem" />
                                    </div>
                                    <Skeleton width="4rem" height="1.5rem" borderRadius="6px" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="col-12 lg:col-6">
                    <Card title="" className="shadow-2 h-full">
                        <Skeleton width="10rem" height="1.25rem" className="mb-3" />
                        <div className="flex flex-column gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex justify-content-between align-items-center p-2">
                                    <div className="flex flex-column gap-2" style={{ flex: 1 }}>
                                        <Skeleton width="60%" height="1rem" />
                                        <Skeleton width="40%" height="0.75rem" />
                                    </div>
                                    <Skeleton width="5rem" height="1rem" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
