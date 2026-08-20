import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const PregnancyDetailSkeleton: React.FC = () => {
    return (
        <div>
            <div className="flex justify-content-between align-items-start mb-4">
                <div>
                    <Skeleton width="5rem" height="1.5rem" className="mb-2" />
                    <Skeleton width="16rem" height="2rem" className="mb-2" />
                    <div className="flex gap-2 mt-2">
                        <Skeleton width="5rem" height="1.5rem" borderRadius="6px" />
                        <Skeleton width="6rem" height="1.5rem" borderRadius="6px" />
                        <Skeleton width="6rem" height="1.5rem" borderRadius="6px" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton width="8rem" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="10rem" height="2.5rem" borderRadius="6px" />
                </div>
            </div>

            <div className="grid mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="col-6 md:col-3">
                        <Card className="shadow-2">
                            <Skeleton width="50%" height="0.75rem" className="mb-2" />
                            <Skeleton width="70%" height="1.5rem" />
                        </Card>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex gap-3 mb-3 border-bottom-1 surface-border pb-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} width="8rem" height="1.5rem" />
                    ))}
                </div>
                <Card className="shadow-2">
                    <Skeleton width="100%" height="10rem" />
                </Card>
            </div>
        </div>
    );
};

export default PregnancyDetailSkeleton;
