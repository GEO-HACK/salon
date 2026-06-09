const placeholders = [
  { label: 'Box Braids', bg: 'bg-rose-100' },
  { label: 'Bridal Glam', bg: 'bg-pink-100' },
  { label: 'Gel Nails', bg: 'bg-fuchsia-50' },
  { label: 'Knotless Braids', bg: 'bg-rose-50' },
  { label: 'Facial Treatment', bg: 'bg-pink-50' },
  { label: 'Full Glam Makeup', bg: 'bg-rose-100' },
  { label: 'Nail Art', bg: 'bg-fuchsia-100' },
  { label: 'Natural Twist Out', bg: 'bg-pink-100' },
  { label: 'Classic Cut', bg: 'bg-rose-50' },
  { label: 'Pedicure', bg: 'bg-pink-50' },
  { label: 'Skincare Glow', bg: 'bg-fuchsia-50' },
  { label: 'Blowout', bg: 'bg-rose-100' },
]

export default function GalleryPage() {
  return (
    <main>
      {/* Header */}
      <section className="bg-brand-pink-light py-20 text-center">
        <p className="text-brand-pink text-xs tracking-[0.35em] uppercase mb-3">Our Work</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-charcoal">Gallery</h1>
        <p className="mt-4 text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
          A glimpse into the transformations that happen inside Beauty Brand every single day.
        </p>
      </section>

      {/* Grid */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {placeholders.map((item, i) => (
              <div
                key={i}
                className={`${item.bg} rounded-2xl aspect-square flex items-end p-4 group cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <span className="text-xs text-neutral-400 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-neutral-400 mt-8">
            Real salon photos coming soon — these are placeholders.
          </p>
        </div>
      </section>
    </main>
  )
}
