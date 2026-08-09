"use client";

import { useRef, useState } from "react";
import { readFileAsDataUrl, uploadFile } from "../../lib/admin-client";

export function Field({ label, hint, children }) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      {children}
      {hint && <div className="adm-field-hint">{hint}</div>}
    </div>
  );
}

export function TextInput({ label, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input className="adm-input" {...props} />
    </Field>
  );
}

export function TextArea({ label, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className="adm-textarea" {...props} />
    </Field>
  );
}

export function Select({ label, hint, options = [], ...props }) {
  return (
    <Field label={label} hint={hint}>
      <select className="adm-select" {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="adm-toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`adm-toggle${checked ? " is-on" : ""}`}
        onClick={() => onChange(!checked)}
      />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </div>
  );
}

export function ListEditor({ items = [], onChange, placeholder = "", addLabel = "Add" }) {
  const update = (i, value) =>
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div>
      {items.map((item, i) => (
        <div className="adm-list-editor-item" key={i}>
          <input
            className="adm-input"
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => remove(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-outline adm-btn-sm" onClick={add}>
        + {addLabel}
      </button>
    </div>
  );
}

export function PairListEditor({
  items = [],
  onChange,
  keyLabel = "Title",
  valueLabel = "Detail",
  keyPlaceholder = "",
  valuePlaceholder = "",
  addLabel = "Add",
}) {
  const update = (i, key, value) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { [keyLabel.toLowerCase()]: "", [valueLabel.toLowerCase()]: "" }]);

  return (
    <div>
      {items.map((item, i) => (
        <div className="adm-kv-editor" key={i}>
          <div className="adm-grid-2">
            <Field label={keyLabel}>
              <input
                className="adm-input"
                value={item[keyLabel.toLowerCase()] || ""}
                placeholder={keyPlaceholder}
                onChange={(e) => update(i, keyLabel.toLowerCase(), e.target.value)}
              />
            </Field>
            <Field label={valueLabel}>
              <input
                className="adm-input"
                value={item[valueLabel.toLowerCase()] || ""}
                placeholder={valuePlaceholder}
                onChange={(e) => update(i, valueLabel.toLowerCase(), e.target.value)}
              />
            </Field>
          </div>
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => remove(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-outline adm-btn-sm" onClick={add}>
        + {addLabel}
      </button>
    </div>
  );
}

export function ImageField({ label, value, onChange, wide, folder = "images", hint }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const url = await uploadFile(dataUrl, file.name, folder);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} hint={hint || error}>
      <div className="adm-image-input">
        {value && (
          <img className={`adm-img-preview${wide ? " adm-img-preview--wide" : ""}`} src={value} alt="preview" />
        )}
        <div>
          <input
            className="adm-input"
            value={value || ""}
            placeholder="/images/... or https://... or paste path"
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="button" className="adm-btn adm-btn-outline adm-btn-sm adm-file-btn">
            {busy ? "Uploading…" : "Upload"}
            <input ref={fileRef} type="file" accept={folder === "pdf" ? "application/pdf" : "image/*"} onChange={onFile} />
          </button>
        </div>
      </div>
    </Field>
  );
}

export function FileField({ label, value, onChange, hint, placeholder = "Select or drop a PDF file" }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const url = await uploadFile(dataUrl, file.name, "pdf");
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    upload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    upload(file);
  };

  return (
    <Field label={label} hint={hint || error}>
      <div className="adm-file-input" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        {value && (
          <div className="adm-file-preview">
            <span>{value.split("/").pop()}</span>
          </div>
        )}
        <div>
          <input
            className="adm-input"
            value={value || ""}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="button" className="adm-btn adm-btn-outline adm-btn-sm adm-file-btn">
            {busy ? "Uploading…" : "Upload"}
            <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} />
          </button>
        </div>
      </div>
    </Field>
  );
}

export function Alert({ kind = "error", children }) {
  return <div className={`adm-alert adm-alert-${kind}`}>{children}</div>;
}

export function Pending({ busy, text = "Saving…" }) {
  if (!busy) return null;
  return <div className="adm-saving">{text}</div>;
}
