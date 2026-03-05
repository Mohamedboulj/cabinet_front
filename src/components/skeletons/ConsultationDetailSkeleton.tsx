import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const ConsultationDetailSkeleton: React.FC = () => {
    return (
        <div>
            {/* Header */}
            <div className="flex justify-content-between align-items-start mb-4">
                <div>
                    <Skeleton width="5rem" height="1.5rem" className="mb-2" />
                    <Skeleton width="14rem" height="2rem" className="mb-2" />
                    <div className="flex gap-2 mt-2">
                        <Skeleton width="5rem" height="1.5rem" borderRadius="6px" />
                        <Skeleton width="5rem" height="1.5rem" borderRadius="6px" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="6rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                </div>
            </div>

            {/* Patient & Doctor Info */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6">
                    <Card className="shadow-2">
                        <Skeleton width="4rem" height="1.25rem" className="mb-3" />
                        <div className="flex flex-column gap-2">
                            <Skeleton width="70%" height="1rem" />
                            <Skeleton width="50%" height="1rem" />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6">
                    <Card className="shadow-2">
                        <Skeleton width="5rem" height="1.25rem" className="mb-3" />
                        <div className="flex flex-column gap-2">
                            <Skeleton width="60%" height="1rem" />
                            <Skeleton width="55%" height="1rem" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tab View Placeholder */}
            <div>
                <div className="flex gap-3 mb-3 border-bottom-1 surface-border pb-2">
                    <Skeleton width="8rem" height="1.5rem" />
                    <Skeleton width="8rem" height="1.5rem" />
                    <Skeleton width="8rem" height="1.5rem" />
                    <Skeleton width="8rem" height="1.5rem" />
                </div>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <Card className="shadow-2 mb-3">
                            <Skeleton width="4rem" height="1rem" className="mb-2" />
                            <Skeleton width="100%" height="3rem" />
                        </Card>
                        <Card className="shadow-2 mb-3">
                            <Skeleton width="6rem" height="1rem" className="mb-2" />
                            <Skeleton width="100%" height="3rem" />
                        </Card>
                    </div>
                    <div className="col-12 md:col-6">
                        <Card className="shadow-2 mb-3">
                            <Skeleton width="6rem" height="1rem" className="mb-2" />
                            <Skeleton width="100%" height="3rem" />
                        </Card>
                        <Card className="shadow-2 mb-3">
                            <Skeleton width="8rem" height="1rem" className="mb-2" />
                            <Skeleton width="100%" height="3rem" />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationDetailSkeleton;
