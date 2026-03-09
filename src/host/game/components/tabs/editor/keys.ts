export const roundKey = (r: { id?: number; _tmpId?: string }) =>
    r.id ? `r_${r.id}` : `r_${r._tmpId}`;

export const questionKey = (q: { id?: number; _tmpId?: string }) =>
    q.id ? `q_${q.id}` : `q_${q._tmpId}`;
