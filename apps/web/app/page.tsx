import Link from 'next/link'

const services = [
  {
    emoji: '✂️',
    title: 'Hair Styling',
    description:
      'Precision cuts, blowouts, braiding, and luxury treatments tailored to your hair type and lifestyle.',
    price: 'From KES 2,500',
  },
  {
    emoji: '💅',
    title: 'Nail Art',
    description:
      'Express yourself with custom nail designs, gel, acrylics, and spa manicures by skilled artists.',
    price: 'From KES 1,500',
  },
  {
    emoji: '✨',
    title: 'Skincare & Facials',
    description:
      'Rejuvenating facials and skincare treatments using premium products for a radiant, glowing complexion.',
    price: 'From KES 3,000',
  },
  {
    emoji: '💄',
    title: 'Makeup',
    description:
      'Professional makeup for events, photoshoots, or everyday glam. Look your absolute best.',
    price: 'From KES 2,000',
  },
]

const features = [
  {
    title: 'Expert Stylists',
    description: 'Our team holds international certifications and stays ahead of global beauty trends.',
  },
  {
    title: 'Premium Products',
    description: 'We exclusively use luxury, skin-safe brands trusted by professionals worldwide.',
  },
  {
    title: 'Personalized Care',
    description: 'Every treatment is customized to you — your face, hair type, and personal style.',
  },
]

const testimonials = [
  {
    name: 'Amina W.',
    role: 'Loyal client since 2022',
    quote:
      "Beauty Brand has completely changed how I feel about self-care. The stylists here genuinely listen and deliver results I couldn't have imagined.",
  },
  {
    name: 'Grace M.',
    role: 'Wedding client',
    quote:
      'My bridal look was absolutely perfect. The team made me feel like royalty on my most important day. I would choose them a thousand times over.',
  },
  {
    name: 'Priya K.',
    role: 'Monthly regular',
    quote:
      'The atmosphere is calming, the products are amazing, and the results always exceed my expectations. My go-to spot in Nairobi.',
  },
]

export default function HomePage() {
  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-brand-pink-light opacity-70 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[280px] h-[280px] rounded-full bg-brand-pink-light opacity-50 -translate-x-1/2 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[120px] h-[120px] rounded-full bg-brand-pink opacity-10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="max-w-2xl">
            <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-5">
              Nairobi&apos;s Premier Beauty Destination
            </p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-brand-charcoal mb-6">
              Where Beauty<br />
              Meets{' '}
              <span className="italic text-brand-pink">Luxury</span>
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed mb-10 max-w-lg">
              Experience world-class hair care, nail art, and skincare from Nairobi&apos;s most
              trusted beauty experts. Every visit, a transformation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-brand-pink text-white text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/20"
              >
                Book Your Appointment
              </Link>
              <Link
                href="/services"
                className="px-8 py-4 border border-neutral-200 text-brand-charcoal text-sm tracking-widest uppercase rounded-full hover:border-brand-pink hover:text-brand-pink transition-all"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Preview ─────────────────────────────────── */}
      <section className="bg-brand-pink-light py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">What We Offer</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-2xl p-7 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl">{service.emoji}</span>
                <div>
                  <h3 className="font-serif text-xl text-brand-charcoal mb-2">{service.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{service.description}</p>
                </div>
                <p className="text-brand-pink text-sm font-medium mt-auto">{service.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-block px-8 py-3.5 border border-brand-pink text-brand-pink text-sm tracking-widest uppercase rounded-full hover:bg-brand-pink hover:text-white transition-all"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">Why Beauty Brand</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal">The Difference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-gold-light text-brand-gold flex items-center justify-center text-lg font-serif mx-auto mb-5">
                  {i + 1}
                </div>
                <h3 className="font-serif text-xl text-brand-charcoal mb-3">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="bg-brand-charcoal py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">Clients Love Us</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white">What They Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-neutral-800/50 rounded-2xl p-8 flex flex-col gap-4">
                <p className="text-brand-gold text-2xl font-serif leading-none">&ldquo;</p>
                <p className="text-neutral-300 text-sm leading-relaxed flex-1">{t.quote}</p>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────── */}
      <section className="bg-brand-pink py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Ready for Your Transformation?
          </h2>
          <p className="text-white/80 text-base mb-10 max-w-md mx-auto">
            Book your appointment today and experience the Beauty Brand difference firsthand.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-brand-pink text-sm tracking-widest uppercase rounded-full hover:bg-brand-cream transition-all shadow-lg"
          >
            Book Now
          </Link>
        </div>
      </section>
    </main>
  )
}
