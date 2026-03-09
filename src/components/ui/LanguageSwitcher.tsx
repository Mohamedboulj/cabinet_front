import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';

const FranceFlag = () => (

    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 512 512"><mask id="a"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#a)"><path fill="#eee" d="M167 0h178l25.9 252.3L345 512H167l-29.8-253.4z" /><path fill="#0052b4" d="M0 0h167v512H0z" /><path fill="#d80027" d="M345 0h167v512H345z" /></g></svg>
);

const UKFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 512 512"><mask id="a"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#a)"><path fill="#eee" d="m0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z" /><path fill="#0052b4" d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z" /><path fill="#d80027" d="M0 0v45l131 131h45L0 0zm208 0v208H0v96h208v208h96V304h208v-96H304V0h-96zm259 0L336 131v45L512 0h-45zM176 336 0 512h45l131-131v-45zm160 0 176 176v-45L381 336h-45z" /></g></svg>
);

const flags: Record<string, React.FC> = {
    fr: FranceFlag,
    en: UKFlag,
};

const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
];

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const menuRef = useRef<Menu>(null);
    const currentLang = i18n.language;
    const CurrentFlag = flags[currentLang] || FranceFlag;

    const menuItems = languages.map((lang) => ({
        template: () => {
            const Flag = flags[lang.code] || FranceFlag;
            const isActive = currentLang === lang.code;
            return (
                <button
                    onClick={() => {
                        i18n.changeLanguage(lang.code);
                        menuRef.current?.hide({} as any);
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 14px',
                        border: 'none',
                        background: isActive ? 'var(--primary-100, #e3f2fd)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: 'var(--text-color)',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--surface-hover, #f5f5f5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = isActive ? 'var(--primary-100, #e3f2fd)' : 'transparent';
                    }}
                >
                    <Flag />
                    {lang.label}
                    {isActive && <i className="pi pi-check" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--primary-color)' }} />}
                </button>
            );
        },
    }));

    return (
        <>
            <Button
                tooltip={currentLang === 'fr' ? 'Changer la langue' : 'Change language'}
                onClick={(e) => menuRef.current?.toggle(e)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover, rgba(0,0,0,0.04))')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 0.2rem var(--primary-color-20)')}
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
                <CurrentFlag />
            </Button>
            <Menu
                model={menuItems}
                popup
                ref={menuRef}
                style={{ minWidth: '160px' }}
            />
        </>
    );
};

export default LanguageSwitcher;
