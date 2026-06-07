import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from '@/hooks/useTranslation';

interface ResumeLinkProps {
    ariaLabel: string;
    className: string;
    href: string;
    iconClassName?: string;
    label: string;
}

export function ResumeLink({
    ariaLabel,
    className,
    href,
    iconClassName = 'fa-solid fa-file-lines text-cyan-200',
    label,
}: ResumeLinkProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const titleId = useId();
    const bodyId = useId();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const modal =
        isOpen && typeof document !== 'undefined'
            ? createPortal(
                  <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/78 px-4 backdrop-blur-md"
                      onMouseDown={() => setIsOpen(false)}
                  >
                      <section
                          aria-describedby={bodyId}
                          aria-labelledby={titleId}
                          aria-modal="true"
                          className="w-full max-w-md rounded-lg border border-cyan-100/18 bg-[#08111f] p-6 text-left text-white shadow-2xl shadow-cyan-950/40"
                          onMouseDown={(event) => event.stopPropagation()}
                          role="dialog"
                      >
                          <div className="flex items-start justify-between gap-4">
                              <div>
                                  <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/72 uppercase">
                                      {t('common.resumeModal.kicker')}
                                  </p>
                                  <h2
                                      id={titleId}
                                      className="mt-2 text-2xl font-semibold tracking-tight"
                                  >
                                      {t('common.resumeModal.title')}
                                  </h2>
                              </div>
                              <button
                                  type="button"
                                  aria-label={t('common.resumeModal.close')}
                                  className="grid size-9 cursor-pointer place-items-center rounded-full border border-cyan-100/16 bg-cyan-50/6 text-cyan-100 transition hover:border-cyan-100/34 hover:bg-cyan-50/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                  onClick={() => setIsOpen(false)}
                              >
                                  <i aria-hidden="true" className="fa-solid fa-xmark" />
                              </button>
                          </div>

                          <p
                              id={bodyId}
                              className="mt-5 text-base leading-relaxed text-slate-200"
                          >
                              {t('common.resumeModal.body')}
                          </p>

                          <div className="mt-6">
                              <a
                                  href={href}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded border border-cyan-200/44 bg-cyan-200/12 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                  target="_blank"
                                  rel="noreferrer"
                              >
                                  <i
                                      aria-hidden="true"
                                      className="fa-solid fa-arrow-up-right-from-square text-cyan-200"
                                  />
                                  {t('common.resumeModal.accept')}
                              </a>
                          </div>
                      </section>
                  </div>,
                  document.body,
              )
            : null;

    return (
        <>
            <button
                type="button"
                aria-label={ariaLabel}
                className={`${className} cursor-pointer`}
                onClick={() => setIsOpen(true)}
            >
                <i aria-hidden="true" className={iconClassName} />
                {label}
            </button>
            {modal}
        </>
    );
}
