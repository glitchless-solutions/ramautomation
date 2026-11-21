import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import RfqForm from './RfqForm';
import styles from './Rfq.module.css';

/** Request-for-quote: checklist of what to send + the form. */
export default function Rfq({ section, site, page, headingId }) {
  const { kicker, heading, intro, checklist = [], form = {} } = section;
  const fields = [...(site.forms.contactFields || []), ...(form.fields || [])];
  return (
    <Section section={section} className={styles.rfq} labelledBy={headingId}>
      <div className={styles.grid}>
        <div className="rev">
          {kicker && <div className="kicker">{kicker}</div>}
          <h2 id={headingId}>
            <Rich text={heading} />
          </h2>
          {intro && (
            <p className={styles.intro}>
              <Rich text={intro} />
            </p>
          )}
          <ul className={styles.check}>
            {checklist.map((c) => (
              <li key={c.title}>
                <Rich text={c.title} />
                {c.hint && (
                  <span>
                    <Rich text={c.hint} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.form} rev`}>
          <RfqForm
            formId={`${page.slug}-rfq`}
            fields={fields}
            subject={form.subject || `Website inquiry — ${page.nav.label}`}
            submitLabel={form.submitLabel || 'Send'}
            endpoint={site.forms.endpoint}
            mailto={site.forms.mailto}
            messages={site.forms.messages}
            source={page.nav.label}
          >
            {form.note && (
              <p className={styles.note}>
                <Rich text={form.note} />
              </p>
            )}
          </RfqForm>
        </div>
      </div>
    </Section>
  );
}
