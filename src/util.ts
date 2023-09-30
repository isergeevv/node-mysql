import { escape } from 'mysql2/promise';

export const generateParameterizedQuery = (queryString: string, values: (string | number)[] = []) => {
  // Parse the query to identify placeholders
  const placeholders = queryString.match(/\?/g);

  if (!placeholders) return queryString;

  if (placeholders.length !== values.length) {
    throw new Error('[util->generateParameterizedQuery] Mismatch between placeholders and values.');
  }

  // Prepare the statement with placeholders
  const preparedQuery = queryString.replace(/\?/g, () => {
    // Ensure proper escaping and formatting based on data type
    return escape(values.shift());
  });

  return preparedQuery;
};
