export const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s));
export const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);
