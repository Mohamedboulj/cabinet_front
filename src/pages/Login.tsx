import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('login.errorDefault'));
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
          <p className="text-600 text-lg">{t('login.subtitle')}</p>
        </div>

        <Card className="shadow-8 p-6 border-round-3xl md:w-30rem m-auto">
          <h2 className="text-2xl font-semibold text-center mb-4">{t('login.title')}</h2>

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
                {t('login.emailLabel')}
              </label>
              <span className="p-input-icon-left w-full">
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className={classNames('w-full', { 'p-invalid': submitted && !email })}
                />
              </span>
              {submitted && !email && (
                <small className="p-error block mt-1">{t('login.emailRequired')}</small>
              )}
            </div>

            <div className="field p-fluid">
              <label htmlFor="password" className="block text-900 font-medium mb-2">
                {t('login.passwordLabel')}
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                toggleMask
                feedback={false}
                className={classNames('w-full', { 'p-invalid': submitted && !password })}
                inputClassName="w-full"
              />
              {submitted && !password && (
                <small className="p-error block mt-1">{t('login.passwordRequired')}</small>
              )}
            </div>

            <Button
              type="submit"
              label={t('login.submit')}
              icon="pi pi-sign-in"
              loading={loading}
              className="w-full mt-2"
            />
          </form>

          <div className="text-center mt-4">
            <a href="#" className="text-primary hover:underline text-sm">
              {t('login.forgotPassword')}
            </a>
          </div>
        </Card>

        <div className="text-center mt-4 text-500 text-sm">
          <p>{t('login.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
