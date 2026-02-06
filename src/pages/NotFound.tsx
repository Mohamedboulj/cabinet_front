import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen surface-ground flex flex-column justify-content-center align-items-center p-4">
      <div className="text-center">
        <i className="pi pi-exclamation-circle text-primary" style={{ fontSize: '8rem' }}></i>
        <h1 className="text-6xl font-bold text-900 mt-4 mb-2">404</h1>
        <h2 className="text-3xl font-semibold text-600 mb-4">Page non trouvée</h2>
        <p className="text-500 text-lg mb-5 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-content-center">
          <Button
            label="Retour au tableau de bord"
            icon="pi pi-home"
            onClick={() => navigate('/dashboard')}
          />
          <Button
            label="Retour en arrière"
            icon="pi pi-arrow-left"
            className="p-button-secondary"
            onClick={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
