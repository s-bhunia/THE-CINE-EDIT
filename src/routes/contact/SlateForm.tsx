import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { site } from '@/content/site';
import { audioEngine } from '@/lib/audio/engine';
import { ENTRANCE_EASE } from '@/lib/motion/easings';
import { ELEMENT_S } from '@/lib/motion/durations';
import { analyticsEvents } from '@/lib/analytics';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const EVENT_TYPES = ['Wedding', 'Commercial', 'Narrative', 'Other'] as const;

const BUDGET_BANDS = [
  'Under ₹25,000',
  '₹25,000 — ₹50,000',
  '₹50,000 — ₹1,00,000',
  'Above ₹1,00,000',
  'Not sure yet',
] as const;

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.email('Valid email is required'),
  eventType: z.enum(EVENT_TYPES),
  date: z.string().min(1, 'Date is required'),
  budget: z.enum(BUDGET_BANDS),
  message: z.string().min(10, 'Provide a bit more detail'),
  honeypot: z.string().max(0).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const MIN_FILL_TIME_MS = 1500;

const CLAPPER_STRIPES =
  'repeating-linear-gradient(45deg, var(--color-ink) 0, var(--color-ink) 20px, var(--color-bone) 20px, var(--color-bone) 40px)';

export function SlateForm() {
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const mountedAt = useRef(Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { honeypot: '', eventType: 'Wedding', budget: 'Not sure yet' },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (data.honeypot || Date.now() - mountedAt.current < MIN_FILL_TIME_MS) {
      setSubmitStatus('success');
      return;
    }

    setSubmitStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Contact submission failed: ${response.status}`);

      audioEngine.play('slate-clap');
      analyticsEvents.enquirySubmit(data.eventType);
      setSubmitStatus('success');
    } catch {
      analyticsEvents.enquiryError();
      setSubmitStatus('error');
    }
  };

  return (
    <div className="relative border-4 border-bone bg-ink w-full max-w-2xl overflow-hidden">
      <motion.div
        initial={{ rotate: -15, originX: 0, originY: 1 }}
        animate={{ rotate: submitStatus === 'success' ? 0 : -15 }}
        transition={{ duration: ELEMENT_S, ease: ENTRANCE_EASE }}
        className="absolute top-0 left-0 w-full h-8 border-b-4 border-ink z-20"
        style={{ backgroundImage: CLAPPER_STRIPES }}
        aria-hidden="true"
      />

      <div
        className="w-full h-8 bg-bone border-b-4 border-ink mb-6"
        style={{ backgroundImage: CLAPPER_STRIPES }}
        aria-hidden="true"
      />

      <div className="p-6">
        <AnimatePresence mode="wait">
          {submitStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center flex flex-col items-center gap-4"
              role="status"
            >
              <span className="metadata text-xl text-bone">CUT — PRINT</span>
              <p className="text-bone-dim">
                Your slate is in the bin. Expect a reply at the address you gave.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-6"
            >
              <input
                type="text"
                {...register('honeypot')}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  id="name"
                  label="PRODUCTION (NAME)"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Field
                  id="email"
                  type="email"
                  label="ROLL (EMAIL)"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  id="eventType"
                  label="SCENE (TYPE)"
                  error={errors.eventType?.message}
                  {...register('eventType')}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Field
                  id="date"
                  type="date"
                  label="DATE"
                  hint="Approximate is fine."
                  error={errors.date?.message}
                  {...register('date')}
                />
              </div>

              <Select
                id="budget"
                label="BUDGET BAND"
                error={errors.budget?.message}
                {...register('budget')}
              >
                {BUDGET_BANDS.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </Select>

              <Field
                id="message"
                label="NOTES"
                multiline
                rows={4}
                hint="Venue, footage volume, delivery deadline — whatever you already know."
                error={errors.message?.message}
                {...register('message')}
              />

              {submitStatus === 'error' && (
                <div className="border border-safelight bg-safelight/10 p-4" role="alert">
                  <span className="metadata text-safelight text-sm">
                    TRANSMISSION FAILED — EMAIL {site.contact.email} DIRECTLY
                  </span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="mt-2 w-full justify-center"
                disabled={submitStatus === 'submitting'}
                pending={submitStatus === 'submitting'}
                pendingLabel="SYNCING"
              >
                MARK (SUBMIT)
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
