export const getSourceLabel = (src: string) => {
  const map: Record<string, string> = {
    'nine_year': 'NINE',
    'twelve': 'TWELVE',
    'grmpts': 'GRAMMAR',
    'essay': 'ESSAYS',
    'dialogue': 'DIALOGUE',
    'ILRDF': 'DICT'
  };
  return map[src] || src.toUpperCase();
};
