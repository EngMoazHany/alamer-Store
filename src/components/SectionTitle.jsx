import { motion } from 'framer-motion'
import { fadeUp, viewportOnce } from '../utils/animations'

function SectionTitle({ kicker, title, align = 'center' }) {
  const alignment = align === 'start' ? 'items-start text-start' : 'items-center text-center'

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={`mb-8 flex flex-col gap-3 ${alignment}`}
    >
      {kicker && (
        <span className="rounded-full border border-gold/40 bg-white/70 px-4 py-1.5 text-xs font-bold text-burgundy shadow-sm">
          {kicker}
        </span>
      )}
      <h2 className="text-3xl font-black text-purpleDark sm:text-4xl">{title}</h2>
      <span className="gold-line-shimmer h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent" />
    </motion.div>
  )
}

export default SectionTitle
