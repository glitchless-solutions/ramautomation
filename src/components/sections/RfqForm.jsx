'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Rfq.module.css';

/**
 * Static-site form. If site.json forms.endpoint is set (Formspree, Web3Forms,
 * or any handler that accepts multipart POST), the form is posted there.
 * Otherwise the visitor's email app opens with the details filled in.
 */
const optValue = (o) => (typeof o === 'string' ? o : o.value);

/** Radio group shown as selectable cards; options are strings or { value, hint }. */
function RadioField({ field, formId }) {
  return (
    <fieldset className={`${styles.field} ${styles.radios}`}>
      <legend>
        {field.label}
        {field.required && <span aria-hidden="true"> *</span>}
      </legend>
      {field.options.map((o, i) => {
        const value = optValue(o);
        const id = `${formId}-${field.name}-${i}`;
        return (
          <label className={styles.radio} htmlFor={id} key={value}>
            <input
              id={id}
              type="radio"
              name={field.name}
              value={value}
              defaultChecked={i === 0}
              required={field.required || undefined}
            />
            <span>
              <strong>{value}</strong>
              {o.hint && <small>{o.hint}</small>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/**
 * File field as a drop zone. The real <input type="file"> fills the zone, so
 * click, keyboard and screen readers work natively; drops are copied into it.
 */
function FileField({ field, formId }) {
  const id = `${formId}-${field.name}`;
  const [files, setFiles] = useState([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  // Clear the file list when the form is reset after a successful send.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => setFiles([]);
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, []);

  const sync = (input) => setFiles(Array.from(input.files || []));
  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    const input = e.currentTarget.querySelector('input[type=file]');
    if (!input || !e.dataTransfer?.files?.length) return;
    input.files = e.dataTransfer.files;
    sync(input);
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{field.label}</label>
      <div
        className={`${styles.drop} ${over ? styles.dropOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={id}
          name={field.name}
          type="file"
          multiple
          accept={field.accept}
          aria-describedby={`${id}-hint`}
          onChange={(e) => sync(e.currentTarget)}
        />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 16V4m0 0-4 4m4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <strong>
          {files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop files here or browse'}
        </strong>
        <small id={`${id}-hint`}>{field.hint || 'DWG, DXF, PDF, photos or a ZIP'}</small>
      </div>
      {files.length > 0 && (
        <ul className={styles.files}>
          {files.map((f) => (
            <li key={f.name + f.size}>
              <span>{f.name}</span>
              <span>{fmtSize(f.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ field, formId }) {
  if (field.type === 'radio') return <RadioField field={field} formId={formId} />;
  if (field.type === 'file') return <FileField field={field} formId={formId} />;
  const id = `${formId}-${field.name}`;
  const common = {
    id,
    name: field.name,
    required: field.required || undefined,
    autoComplete: field.autoComplete,
    placeholder: field.placeholder,
  };
  let control;
  if (field.type === 'select') {
    control = (
      <select {...common} defaultValue={field.options?.[0]}>
        {field.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = <textarea {...common} rows={field.rows || 4} />;
  } else {
    control = <input {...common} type={field.type || 'text'} />;
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
    </div>
  );
}

export default function RfqForm({ formId, fields, subject, submitLabel, endpoint, mailto, messages, source, children }) {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error | mailto

  const flat = fields.flat();

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return; // honeypot filled → bot

    data.set('_subject', subject);
    data.set('source_page', source);

    if (endpoint) {
      setStatus('sending');
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus('success');
      } catch {
        setStatus('error');
      }
      return;
    }

    const lines = flat
      .filter((f) => f.type !== 'file')
      .map((f) => `${f.label}: ${data.get(f.name) || '—'}`);
    const attached = flat
      .filter((f) => f.type === 'file')
      .flatMap((f) => data.getAll(f.name))
      .filter((v) => v && v.name);
    if (attached.length) {
      lines.push('', `Files to attach to this email: ${attached.map((f) => f.name).join(', ')}`);
    }
    lines.push('', `Sent from the ${source} page`);
    const href = `mailto:${mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    window.location.href = href;
    setStatus('mailto');
  }

  const message = status !== 'idle' ? messages?.[status] : '';

  return (
    <form id={formId} onSubmit={onSubmit} encType="multipart/form-data">
      {fields.map((row, i) =>
        Array.isArray(row) ? (
          <div className={styles.row2} key={i}>
            {row.map((f) => (
              <Field field={f} formId={formId} key={f.name} />
            ))}
          </div>
        ) : (
          <Field field={row} formId={formId} key={row.name} />
        ),
      )}

      {/* honeypot: hidden from people, tempting to bots */}
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor={`${formId}-gotcha`}>Leave this empty</label>
        <input id={`${formId}-gotcha`} type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="btn btn--dark" type="submit" disabled={status === 'sending'} style={{ width: '100%' }}>
        {status === 'sending' ? messages?.sending || 'Sending…' : submitLabel}
      </button>

      <p className={`${styles.status} ${status === 'error' ? styles.error : ''}`} role="status" aria-live="polite">
        {message}
      </p>
      {children}
    </form>
  );
}
