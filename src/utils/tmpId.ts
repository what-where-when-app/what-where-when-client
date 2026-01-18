let n = 1;
export function tmpId(prefix = "tmp") {
    n += 1;
    return `${prefix}_${Date.now()}_${n}`;
}
