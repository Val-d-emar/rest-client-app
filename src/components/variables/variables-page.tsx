'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslations } from 'next-intl';
import { v4 as uuidv4 } from 'uuid';
import classes from './variables-page.module.css';

type VariableItem = {
  id: string;
  key: string;
  value: string;
};

export default function VariablesPage() {
  const t = useTranslations('VariablesPage');
  const { user } = useAuth();

  const storageKey = user ? `app-variables-${user.uid}` : 'app-variables-unauthorized-access';
  const [variables, setVariables] = useLocalStorage<VariableItem[]>(storageKey, []);

  const handleAddVariable = () => {
    setVariables([...variables, { id: uuidv4(), key: '', value: '' }]);
  };

  const handleRemoveVariable = (id: string) => {
    setVariables(variables.filter((variable) => variable.id !== id));
  };

  const handleVariableChange = (id: string, field: 'key' | 'value', text: string) => {
    setVariables(
      variables.map((variable) => (variable.id === id ? { ...variable, [field]: text } : variable)),
    );
  };

  return (
    <section className={classes.wrapper}>
      <h1>{t('title')}</h1>
      <p className='centered'>{t('description')}</p>

      <div className={classes['variables-wrapper']}>
        <div className='card'>
          {variables.map((variable) => (
            <div key={variable.id} className={classes.row}>
              <div className={classes['inputs-wrapper']}>
                <input
                  type='text'
                  name={`variable-key-${variable.id}`}
                  placeholder={t('keyPlaceholder')}
                  value={variable.key}
                  onChange={(e) => handleVariableChange(variable.id, 'key', e.target.value)}
                  style={{ flexGrow: 1 }}
                  autoComplete='off'
                />
                <input
                  type='text'
                  name={`variable-value-${variable.id}`}
                  placeholder={t('valuePlaceholder')}
                  value={variable.value}
                  onChange={(e) => handleVariableChange(variable.id, 'value', e.target.value)}
                  style={{ flexGrow: 2 }}
                  autoComplete='off'
                />
              </div>
              <button
                type='button'
                onClick={() => handleRemoveVariable(variable.id)}
                className={`error-button ${classes.button}`}
              >
                {t('deleteButton')}
              </button>
            </div>
          ))}
          <button type='button' onClick={handleAddVariable} className={classes.button}>
            {t('addButton')}
          </button>
        </div>
      </div>
    </section>
  );
}
