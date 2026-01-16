export function parseCombinedLog(msg: string) {
  //     convert Apache combined log to JSON
  const [date, time, method, path, status, size, referer, userAgent] =
    msg.split(" ");
  const timestamp = new Date(`${date} ${time}`);
  const log = {
    date,
    time,
    method,
    path,
    status,
    size,
    referer,
    userAgent,
    timestamp,
  };
  return log;
}
