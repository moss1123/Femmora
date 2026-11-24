import { AnimatePresence, motion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Inline field error: announced (role="alert"), linked by id from aria-describedby, eased in and out.
 * mode="wait": when the message changes, the old one leaves before the new one arrives — never two nodes with one id.
 */
export default function ErrorText({ id, children }: { id: string; children?: string | null }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {children && (
        <motion.p
          key={children}
          id={id}
          className="cus-err"
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <svg viewBox="0 0 12 12" aria-hidden>
            <circle cx="6" cy="6" r="5.25" />
            <path d="M6 3.2v3.4M6 8.4v.1" />
          </svg>
          {children}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
