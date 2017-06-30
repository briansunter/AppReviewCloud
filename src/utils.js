export function flatMap(lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
}

export function count(arr) {
  return arr.reduce((m, e) => {
    m[e] = (+m[e] || 0) + 1; return m;
  }, {});
}
