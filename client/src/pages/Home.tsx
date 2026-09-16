import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Disc as DiscordIcon, Shield, Cpu, Zap, Star, Sparkles, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api';
import { Product, SiteSettings, Review, Announcement } from '../types';
import { ProductCard } from '../components/store/ProductCard';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, revRes, annRes, setRes] = await Promise.all([
          api.get('/products?featured=true'),
          api.get('/reviews'),
          api.get('/announcements'),
          api.get('/settings/public'),
        ]);
        setFeaturedProducts(prodRes.data.products || []);
        setReviews(revRes.data.reviews?.slice(0, 6) || []);
        setAnnouncements(annRes.data.announcements || []);
        setSettings(setRes.data.settings || null);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const stats = settings?.site_stats || {
    resources: '50+',
    customers: '1,000+',
    positiveFeedback: '99%',
    support: '24/7',
  };

  const discordWidget = settings?.discord_widget || {
    serverName: 'Vertex Studio Official',
    inviteUrl: 'https://discord.gg/vertexstudio',
    onlineCount: 428,
    totalMembers: 4890,
  };

  return (
    <div className="space-y-24">
      {/* Announcements Ticker */}
      {announcements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-850/80 border border-white/10 backdrop-blur-md text-xs">
            <span className="px-2.5 py-0.5 rounded-md font-bold bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border border-[var(--brand-primary)]/40 shrink-0">
              {announcements[0].badge}
            </span>
            <p className="text-gray-300 truncate flex-1">
              {announcements[0].title}: {announcements[0].content}
            </p>
            {announcements[0].link_url && (
              <Link
                to={announcements[0].link_url}
                className="text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold shrink-0"
              >
                <span>Learn More</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Official Logo Display */}
          <div className="inline-block relative mb-8 group">
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--brand-primary)]/30 to-white/10 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <img
              src="/logo.png"
              alt="Vertex Studio 3D Chrome Logo"
              className="relative w-48 sm:w-64 md:w-80 h-auto mx-auto object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Tagline Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-850 border border-white/10 text-xs font-semibold text-gray-300 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Next Generation FiveM Engineering</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight font-display max-w-4xl mx-auto leading-[1.1]">
            Premium FiveM Resources.{' '}
            <span className="bg-gradient-to-r from-white via-gray-200 to-[var(--brand-primary)] bg-clip-text text-transparent">
              Built Different.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Powerful, optimized and beautifully designed resources built to take your FiveM server to the next level.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/store"
              className="px-8 py-4 rounded-xl font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-all duration-300 shadow-xl shadow-[var(--brand-glow)] flex items-center gap-2 group hover:scale-[1.02]"
            >
              <span>Explore Scripts</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="https://discord.gg/vertexstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-semibold text-white bg-dark-850 hover:bg-dark-800 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2.5 backdrop-blur-md hover:scale-[1.02]"
            >
              <DiscordIcon className="w-5 h-5 text-[#5865F2]" />
              <span>Join Discord</span>
            </a>
          </div>

          {/* Realistic FiveM UI Mockup Preview */}
          <div className="mt-16 max-w-5xl mx-auto relative rounded-2xl p-2 bg-gradient-to-b from-white/15 to-transparent border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="rounded-xl overflow-hidden bg-dark-900 border border-white/5 relative aspect-video flex items-center justify-center group">
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80"
                alt="FiveM In-Game Script Preview"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
              
              {/* Overlay Glass Elements Representing FiveM NUI */}
              <div className="absolute top-6 left-6 flex items-center gap-3 p-3 rounded-xl bg-dark-900/85 backdrop-blur-md border border-white/10 text-left">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white tracking-wider uppercase">VERTEX ACTIVE HUD</div>
                  <div className="text-[10px] text-gray-400">Resmon: 0.00ms • Tick: 64Hz</div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-dark-900/85 backdrop-blur-md border border-white/10">
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Vertex Loading Screen & Mechanics Suite</div>
                  <div className="text-xs text-gray-400">Integrated QBCore & ESX Legacy Architecture</div>
                </div>
                <Link
                  to="/store"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--brand-primary)] text-black hover:bg-[var(--brand-hover)] transition-colors"
                >
                  View In Store
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-dark-850/60 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {stats.resources}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Resources
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-850/60 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {stats.customers}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Customers
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-850/60 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--brand-primary)] font-display">
              {stats.positiveFeedback}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Positive Feedback
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-850/60 border border-white/5 backdrop-blur-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {stats.support}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Support
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SCRIPTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Flagship Releases</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
              Featured Scripts
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-lg">
              Explore our most popular, battle-tested FiveM systems deployed on top roleplay servers.
            </p>
          </div>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[var(--brand-primary)] transition-colors group"
          >
            <span>View All Store Products</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* WHY VERTEX STUDIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-dark-850/40 border border-white/5 backdrop-blur-md">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Why Server Owners Choose Vertex
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              We design software specifically to alleviate client frame drops and minimize administrative overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-2xl bg-dark-900/60 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">0.00ms Resmon Performance</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Zero garbage collection bottlenecks. Every loop, export, and tick rate is strictly profiled to ensure maximum server and client FPS.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-dark-900/60 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Automated Licensing</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                No waiting for manual approvals. The second payment confirms, your unique VERTEX license is generated and packages are ready to download.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-dark-900/60 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Dedicated Support & Updates</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full documentation, discord ticketing, and regular feature updates keep your FiveM server ahead of the competition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCORD COMMUNITY WIDGET BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-[#5865F2]/15 via-dark-850 to-dark-850 border border-[#5865F2]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-xs font-semibold text-[#8B96F8]">
              <DiscordIcon className="w-3.5 h-3.5" />
              <span>Official Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Join {discordWidget.serverName}
            </h2>
            <p className="text-sm text-gray-400 max-w-xl">
              Get direct technical assistance, connect with other FiveM server developers, suggest new features, and receive early access announcements.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs text-gray-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <strong>{discordWidget.onlineCount}</strong> Online
              </span>
              <span className="text-gray-600">•</span>
              <span>
                <strong>{discordWidget.totalMembers}</strong> Members
              </span>
            </div>
          </div>

          <a
            href={discordWidget.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] transition-all duration-200 shadow-xl shadow-[#5865F2]/30 shrink-0 flex items-center gap-2.5 hover:scale-105"
          >
            <DiscordIcon className="w-5 h-5" />
            <span>Join Discord Server</span>
          </a>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-2">
              <Star className="w-4 h-4 fill-current" />
              <span>Verified Testimonials</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-display">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-dark-850/70 border border-white/5 backdrop-blur-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                  <img
                    src={rev.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rev'}
                    alt={rev.username}
                    className="w-9 h-9 rounded-full object-cover bg-dark-750 border border-white/10"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.username}</h4>
                    <span className="text-[10px] text-gray-500 block">
                      {rev.product_title || 'Verified Server Owner'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
