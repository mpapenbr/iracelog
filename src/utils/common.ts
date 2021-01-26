export function extractRaceUUID(pathname: string): string {
  const regex = /.*?\/details\/(?<myId>.*?)\/.*$/;
  const { myId } = pathname.match(regex)?.groups!;
  return myId;
}
