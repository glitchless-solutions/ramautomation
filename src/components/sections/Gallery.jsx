import Image from 'next/image';
import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Gallery.module.css';

/**
 * Photo grid. Items are { src, alt, width, height, caption? } or
 * { placeholder: "shot description" } for a photo still to be taken.
 */
export default function Gallery({ section, headingId }) {
  const { kicker, heading, intro, items = [], note } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <div className={`${styles.grid} rev`}>
        {items.map((img, i) =>
          img.placeholder ? (
            <div className={styles.placeholder} key={i}>
              <span>
                <Rich text={img.placeholder} />
              </span>
            </div>
          ) : (
            <figure className={styles.figure} key={img.src}>
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 380px"
                loading="lazy"
              />
              {img.caption && (
                <figcaption>
                  <Rich text={img.caption} />
                </figcaption>
              )}
            </figure>
          ),
        )}
      </div>
      {note && (
        <p className="note">
          <Rich text={note} />
        </p>
      )}
    </Section>
  );
}
