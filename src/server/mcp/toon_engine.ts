/**
 * TOON (Token-Oriented Object Notation) Engine
 * Compresses verbose LLM context and JSON payloads into ultra-compact, high-density structured tokens
 * to protect the 8GB edge memory ceiling.
 */
export function compressToTOON(data: Record<string, any> | Array<any> | string): string {
  if (typeof data === 'string') {
    return `[TOON:STR|L=${data.length}]::"${data.slice(0, 180)}..."`;
  }

  if (Array.isArray(data)) {
    const items = data.slice(0, 5).map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const keys = Object.keys(item).slice(0, 4);
        return `#${idx}{${keys.map(k => `${k}:${JSON.stringify(item[k])}`).join('|')}}`;
      }
      return `#${idx}:${item}`;
    });
    return `[TOON:VEC|N=${data.length}]<${items.join(' ; ')}>`;
  }

  const entries = Object.entries(data).map(([key, val]) => {
    if (Array.isArray(val)) {
      return `${key}:[x${val.length}]`;
    }
    if (typeof val === 'object' && val !== null) {
      const subKeys = Object.keys(val).slice(0, 3).join(',');
      return `${key}:{${subKeys}}`;
    }
    return `${key}:${val}`;
  });

  return `[TOON:DICT|KEYS=${Object.keys(data).length}]{ ${entries.join(' ⬡ ')} }`;
}
