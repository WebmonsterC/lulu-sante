import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { CalendarBlank } from "@phosphor-icons/react";
import "react-day-picker/style.css";
import { TermLabel } from "./TermTooltip";
import type { GlossaryKey } from "../data/glossary";
import {
  formatDateFr,
  isoToDate,
  parseDateFr,
  dateToIso,
  getIsoRangeError,
} from "../lib/dates";

type DateInputProps = {
  label: string;
  hintText?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  required?: boolean;
  id?: string;
  /** Date minimale autorisée (inclusive), format ISO. */
  minDate?: string;
  /** Date maximale autorisée (inclusive), format ISO. */
  maxDate?: string;
  /** Clé glossaire pour infobulle sur le libellé. */
  term?: GlossaryKey;
};

export function DateInput({
  label,
  hintText,
  value,
  defaultValue,
  onChange,
  required,
  id,
  minDate,
  maxDate,
  term,
}: DateInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-desc-error`;
  const containerRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [internalIso, setInternalIso] = useState(defaultValue ?? "");
  const iso = isControlled ? value : internalIso;
  const [text, setText] = useState(() => (iso ? formatDateFr(iso) : ""));
  const [open, setOpen] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const disabledDays = useMemo(() => {
    const matchers = [];
    const min = isoToDate(minDate);
    const max = isoToDate(maxDate);
    if (min) matchers.push({ before: min });
    if (max) matchers.push({ after: max });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  useEffect(() => {
    if (isControlled) {
      setText(value ? formatDateFr(value) : "");
    }
  }, [isControlled, value]);

  useEffect(() => {
    if (!iso) {
      setRangeError(null);
      return;
    }
    setRangeError(getIsoRangeError(iso, minDate, maxDate));
  }, [iso, minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const errorMessage = formatError ?? rangeError;
  const hasError = errorMessage !== null;

  function setIso(next: string) {
    if (!isControlled) setInternalIso(next);
    onChange?.(next);
  }

  function applyIso(next: string) {
    const violation = getIsoRangeError(next, minDate, maxDate);
    if (violation) {
      setRangeError(violation);
      setText(iso ? formatDateFr(iso) : "");
      return;
    }
    setRangeError(null);
    setFormatError(null);
    setText(next ? formatDateFr(next) : "");
    setIso(next);
  }

  function handleDaySelect(date: Date | undefined) {
    if (!date) return;
    applyIso(dateToIso(date));
    setOpen(false);
  }

  function handleTextBlur() {
    if (!text.trim()) {
      setFormatError(null);
      setRangeError(null);
      setIso("");
      return;
    }
    const parsed = parseDateFr(text);
    if (!parsed) {
      setFormatError("Saisissez une date au format jj/mm/aaaa.");
      setText(iso ? formatDateFr(iso) : "");
      return;
    }
    applyIso(parsed);
  }

  return (
    <div
      className={`fr-input-group${hasError ? " fr-input-group--error" : ""}`}
      ref={containerRef}
    >
      <TermLabel htmlFor={inputId} term={term} required={required} hintText={hintText}>
        {label}
      </TermLabel>
      <div className="lulu-date-input">
        <input
          className={`fr-input${hasError ? " fr-input--error" : ""}`}
          id={inputId}
          type="text"
          inputMode="numeric"
          placeholder="jj/mm/aaaa"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setFormatError(null);
          }}
          onBlur={handleTextBlur}
          required={required}
          autoComplete="off"
          lang="fr-FR"
          aria-describedby={hasError ? messageId : undefined}
          aria-invalid={hasError || undefined}
        />
        <button
          type="button"
          className="fr-btn fr-btn--secondary lulu-date-input__btn"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Ouvrir le calendrier"
          aria-expanded={open}
          aria-controls={`${inputId}-calendar`}
          title="Ouvrir le calendrier"
        >
          <CalendarBlank weight="duotone" size={20} aria-hidden />
        </button>
        {open ? (
          <div
            id={`${inputId}-calendar`}
            className="lulu-date-input__popover"
            role="dialog"
            aria-label="Calendrier"
          >
            <DayPicker
              mode="single"
              locale={fr}
              selected={isoToDate(iso)}
              onSelect={handleDaySelect}
              weekStartsOn={1}
              disabled={disabledDays}
            />
          </div>
        ) : null}
      </div>
      {hasError ? (
        <div className="fr-messages-group" aria-live="polite">
          <p id={messageId} className="fr-message fr-message--error">
            {errorMessage}
          </p>
        </div>
      ) : null}
    </div>
  );
}
