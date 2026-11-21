export function Loading({ text = "Carregando..." }: { text?: string }) {
  return <p className="msg" role="status">{text}</p>;
}
export function ErrorMsg({ text }: { text: string }) {
  return <p className="msg error" role="alert">{text}</p>;
}
export function Empty({ text }: { text: string }) {
  return <p className="msg" role="status">{text}</p>;
}
