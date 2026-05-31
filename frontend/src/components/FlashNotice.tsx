import { Alert } from "@codegouvfr/react-dsfr/Alert";

type FlashNoticeProps = {
  message: string | null;
  severity?: "success" | "error";
  title?: string;
  onClose: () => void;
};

export function FlashNotice({
  message,
  severity = "success",
  title,
  onClose,
}: FlashNoticeProps) {
  if (!message) return null;

  return (
    <Alert
      className="fr-mb-4w"
      severity={severity}
      title={title ?? (severity === "success" ? "Action enregistrée" : "Erreur")}
      description={message}
      closable
      onClose={onClose}
    />
  );
}
