export function randomColor() {
  if (Math.random() > 0.1) return '';
  return (
    '#' +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0') +
    '80'
  );
}
