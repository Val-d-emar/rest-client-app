'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslations } from 'next-intl';
import { v4 as uuidv4 } from 'uuid';

type VariableItem = {
  id: string;
  key: string;
  value: string;
};

export default function VariablesPage() {
  const t = useTranslations('VariablesPage');

  const [variables, setVariables] = useLocalStorage<VariableItem[]>('app-variables', []);

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
    <div className='container' style={{ maxWidth: '800px' }}>
      <h1>{t('title')}</h1>
      <p className='centered'>{t('description')}</p>

      <div className='card' style={{ marginTop: '2rem' }}>
        {variables.map((variable) => (
          <div key={variable.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type='text'
              placeholder={t('keyPlaceholder')}
              value={variable.key}
              onChange={(e) => handleVariableChange(variable.id, 'key', e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <input
              type='text'
              placeholder={t('valuePlaceholder')}
              value={variable.value}
              onChange={(e) => handleVariableChange(variable.id, 'value', e.target.value)}
              style={{ flexGrow: 2 }}
            />
            <button
              type='button'
              onClick={() => handleRemoveVariable(variable.id)}
              className='error-button'
            >
              {t('deleteButton')}
            </button>
          </div>
        ))}
        <button type='button' onClick={handleAddVariable}>
          {t('addButton')}
        </button>
      </div>
    </div>
  );
}
