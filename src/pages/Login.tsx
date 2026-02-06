import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!email || !password) {
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-ground flex justify-content-center align-items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <div className="flex justify-content-center align-items-center mb-3">
            <i className="pi pi-heart-fill text-primary text-5xl mr-3"></i>
            <h1 className="text-4xl font-bold text-primary m-0">MediCare Pro</h1>
          </div>
          <p className="text-600 text-lg">Système de Gestion Médicale</p>
        </div>

        <Card className="shadow-4">
          <h2 className="text-2xl font-semibold text-center mb-4">Connexion</h2>

          {error && (
            <Message 
              severity="error" 
              text={error} 
              className="w-full mb-3"
            />
          )}

          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <div className="field">
              <label htmlFor="email" className="block text-900 font-medium mb-2">
                Email
              </label>
              <span className="p-input-icon-left w-full">
                <i className="pi pi-envelope" />
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className={classNames('w-full', { 'p-invalid': submitted && !email })}
                />
              </span>
              {submitted && !email && (
                <small className="p-error block mt-1">L'email est requis</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="password" className="block text-900 font-medium mb-2">
                Mot de passe
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                toggleMask
                feedback={false}
                className={classNames('w-full', { 'p-invalid': submitted && !password })}
                inputClassName="w-full"
              />
              {submitted && !password && (
                <small className="p-error block mt-1">Le mot de passe est requis</small>
              )}
            </div>

            <Button
              type="submit"
              label="Se connecter"
              icon="pi pi-sign-in"
              loading={loading}
              className="w-full mt-2"
            />
          </form>

          <div className="text-center mt-4">
            <a href="#" className="text-primary hover:underline text-sm">
              Mot de passe oublié ?
            </a>
          </div>
        </Card>

        <div className="text-center mt-4 text-500 text-sm">
          <p>&copy; 2024 MediCare Pro. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
