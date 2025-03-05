export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  // console.log(
  //   date.toLocaleString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     year: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: true,
  //   }),
  // );
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatISODuration(isoDuration: string | null): string {
  if (!isoDuration) return '-';

  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/.exec(
    isoDuration,
  );
  if (!match) return '-';

  const hours = parseFloat(match[1] || '0');
  const minutes = parseFloat(match[2] || '0');
  const seconds = parseFloat(match[3] || '0');

  const hrs = Math.floor(hours);
  const mins = Math.floor(minutes);
  const secs = Math.floor(seconds);

  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
