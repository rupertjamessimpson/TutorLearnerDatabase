function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export default escapeCsv;