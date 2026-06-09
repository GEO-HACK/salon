import Link from 'next/link'

const services = [
  {
    category: 'Hair',
    items: [
      { name: 'Wash & Blow Dry', description: 'Shampoo, deep condition, and professional blow dry.', price: 2500, duration: 60 },
      { name: 'Precision Cut', description: 'Tailored haircut shaped to complement your face.', price: 3500, duration: 45 },
      { name: 'Hair Treatment', description: 'Intensive repair and nourishment for damaged hair.', price: 4500, duration: 90 },
      { name: 'Box Braids', description: 'Classic or jumbo box braids, any length.', price: 5500, duration: 240 },
      { name: 'Knotless Braids', description: 'Lightweight, tension-free knotless braids.', price: 6500, duration: 270 },
      { name: 'Natural Twist Out', description: 'Defined twist out on natural hair.', price: 3000, duration: 75 },
    ],
  },
  {
    category: 'Nails',
    items: [
      { name: 'Classic Manicure', description: 'Nail shaping, cuticle care, and polish.', price: 1500, duration: 45 },
      { name: 'Gel Manicure', description: 'Long-lasting gel polish with a mirror finish.', price: 2500, duration: 60 },
      { name: 'Acrylic Full Set', description: 'Full set of acrylic extensions, custom shaped.', price: 3500, duration: 90 },
      { name: 'Nail Art Design', description: 'Custom nail art — ask our artists for inspiration.', price: 2000, duration: 60 },
      { name: 'Pedicure', description: 'Foot soak, scrub, massage, and polish.', price: 2000, duration: 60 },
      { name: 'Gel Pedicure', description: 'Pedicure with long-wear gel polish.', price: 2800, duration: 75 },
    ],
  },
  {
    category: 'Skincare',
    items: [
      { name: 'Classic Facial', description: 'Deep cleanse, exfoliation, and mask for glowing skin.', price: 3500, duration: 60 },
      { name: 'Anti-Aging Facial', description: 'Firming treatment targeting fine lines and dullness.', price: 5000, duration: 75 },
      { name: 'Brightening Facial', description: 'Targets uneven tone, dark spots, and hyperpigmentation.', price: 4500, duration: 60 },
      { name: 'Back Treatment', description: 'Deep cleanse and exfoliation for your back.', price: 4000, duration: 60 },
    ],
  },
  {
    category: 'Makeup',
    items: [
      { name: 'Day Makeup', description: 'Natural, polished look for everyday events.', price: 2500, duration: 45 },
      { name: 'Full Glam', description: 'Bold, full coverage look for evenings and events.', price: 4000, duration: 60 },
      { name: 'Bridal Makeup', description: 'Trial + wedding day flawless bridal glam.', price: 8000, duration: 120 },
      { name: 'Makeup Lesson', description: '1-on-1 tutorial customised to your features and kit.', price: 5000, duration: 90 },
    ],
  },
]

export default function ServicesPage() {
  return (
    <main>
      {/* Page header */}
      <section className="bg-brand-pink-light py-20 text-center">
        <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">What We Offer</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-charcoal">Our Services</h1>
        <p className="mt-4 text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
          From hair to nails to skin — every service is performed by trained experts using
          premium products.
        </p>
      </section>

      {/* Services by category */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          {services.map((category) => (
            <div key={category.category}>
              <h2 className="font-serif text-3xl text-brand-charcoal mb-8 pb-4 border-b border-brand-pink-light">
                {category.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((service) => (
                  <div
                    key={service.name}
                    className="border border-neutral-100 rounded-2xl p-6 hover:border-brand-pink hover:shadow-sm transition-all group"
                  >
                    <h3 className="font-serif text-lg text-brand-charcoal mb-2 group-hover:text-brand-pink transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-pink font-medium text-sm">
                        KES {service.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-neutral-400">{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-pink-light py-16 text-center">
        <h2 className="font-serif text-3xl text-brand-charcoal mb-4">
          Ready to treat yourself?
        </h2>
        <p className="text-neutral-500 text-sm mb-8 max-w-sm mx-auto">
          Book any service online in under 2 minutes.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-all shadow-md shadow-brand-pink/20"
        >
          Book Now
        </Link>
      </section>
    </main>
  )
}
