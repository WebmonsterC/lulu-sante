import { Button } from "@codegouvfr/react-dsfr/Button";

type ExportButtonGroupProps = {
  onExportPdf: () => void;
  onExportExcel: () => void;
  pdfLabel?: string;
  excelLabel?: string;
  size?: "sm" | "md";
};

export function ExportButtonGroup({
  onExportPdf,
  onExportExcel,
  pdfLabel = "PDF",
  excelLabel = "Excel",
  size = "md",
}: ExportButtonGroupProps) {
  return (
    <div className="fr-btns-group fr-btns-group--inline">
      <Button priority="secondary" size={size === "sm" ? "small" : undefined} onClick={onExportPdf}>
        {pdfLabel}
      </Button>
      <Button priority="secondary" size={size === "sm" ? "small" : undefined} onClick={onExportExcel}>
        {excelLabel}
      </Button>
    </div>
  );
}
