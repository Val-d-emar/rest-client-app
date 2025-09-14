import { dbg } from '@/log';

type VariableItem = {
  key: string;
  value: string;
};

export const getStoredVariables = (userId: string | null): Record<string, string> => {
  if (typeof window === 'undefined' || !userId) return {};

  const storageKey = `app-variables-${userId}`;

  try {
    const item = window.localStorage.getItem(storageKey);
    if (!item) return {};

    const variablesArray: VariableItem[] = JSON.parse(item);

    return variablesArray.reduce(
      (acc, variable) => {
        if (variable.key) {
          acc[variable.key] = variable.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch (error) {
    dbg('Failed to parse variables from localStorage:', error);
    return {};
  }
};

export const substituteVariables = (input: string, variables: Record<string, string>): string => {
  return input.replace(/{{\s*(\w+)\s*}}/g, (match, variableName) => {
    return variables[variableName] !== undefined ? variables[variableName] : match;
  });
};
