import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const PatientDetailSkeleton: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <div className="flex justify-content-between align-items-start mb-4">
                <div>
                    <Skeleton width="5rem" height="1.5rem" className="mb-2" />
                    <Skeleton width="16rem" height="2rem" className="mb-2" />
                    <div className="flex gap-2 mt-2">
                        <Skeleton width="5rem" height="1.5rem" borderRadius="6px" />
                        <Skeleton width="6rem" height="1.5rem" borderRadius="6px" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton width="8rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="10rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="col-12 md:col-6 lg:col-3">
                        <Card className="shadow-2">
                            <div className="flex align-items-center gap-3">
                                <Skeleton shape="circle" size="2.5rem" />
                                <div className="flex flex-column gap-2" style={{ flex: 1 }}>
                                    <Skeleton width="50%" height="0.75rem" />
                                    <Skeleton width="70%" height="1rem" />
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Tab View Placeholder */}
            <div>
                <div className="flex gap-3 mb-3 border-bottom-1 surface-border pb-2">
                    <Skeleton width="8rem" height="1.5rem" />
                    <Skeleton width="8rem" height="1.5rem" />
                    <Skeleton width="10rem" height="1.5rem" />
                    <Skeleton width="10rem" height="1.5rem" />
                </div>
                <Card className="shadow-2">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <Skeleton width="8rem" height="1.25rem" className="mb-3" />
                            <div className="flex flex-column gap-2">
                                <Skeleton width="100%" height="1rem" />
                                <Skeleton width="80%" height="1rem" />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <Skeleton width="6rem" height="1.25rem" className="mb-3" />
                            <div className="flex flex-column gap-2">
                                <Skeleton width="90%" height="1rem" />
                                <Skeleton width="70%" height="1rem" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PatientDetailSkeleton;
