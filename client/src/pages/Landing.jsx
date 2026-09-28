import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🦉</span>
          <span className="text-[22px] font-black text-[#58CC02] tracking-tight">duolingo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="border-2 border-[#E5E5E5] border-b-[4px] text-[#1CB0F6] font-extrabold uppercase tracking-wider text-sm px-5 py-2 rounded-2xl hover:bg-[#DDF4FF] transition-colors"
          >
            LOG IN
          </Link>
          <Link to="/register" className="btn-green text-sm py-2 px-5">
            GET STARTED
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-black text-[#3C3C3C] leading-tight mb-6">
            The free, fun,<br />
            and effective way<br />
            to learn a language!
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="btn-green text-lg px-10">
              GET STARTED
            </Link>
            <Link
              to="/login"
              className="border-2 border-[#E5E5E5] border-b-[4px] text-[#AFAFAF] font-extrabold uppercase tracking-wider text-lg px-10 py-[14px] rounded-2xl hover:bg-[#F7F7F7] transition-colors text-center"
            >
              I ALREADY HAVE AN ACCOUNT
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0 text-[180px] leading-none animate-bounce">🦉</div>
      </section>

      {/* ── Social proof ── */}
      <section className="bg-[#58CC02] py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          <div>
            <p className="text-5xl font-black mb-2">500M+</p>
            <p className="font-extrabold text-white/80 uppercase tracking-wider text-sm">Learners worldwide</p>
          </div>
          <div>
            <p className="text-5xl font-black mb-2">8</p>
            <p className="font-extrabold text-white/80 uppercase tracking-wider text-sm">Languages available</p>
          </div>
          <div>
            <p className="text-5xl font-black mb-2">FREE</p>
            <p className="font-extrabold text-white/80 uppercase tracking-wider text-sm">Always and forever</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      {[
        {
          emoji: '🎮',
          title: 'Effective and fun',
          body: 'Learning with Duolingo is fun, and research shows it works! Our bite-sized lessons are proven to be effective.',
          color: '#DDF4FF',
        },
        {
          emoji: '🔬',
          title: 'Backed by science',
          body: 'We use a combination of research-backed techniques to keep you motivated and achieving your goals.',
          color: '#D7FFB8',
        },
        {
          emoji: '🏆',
          title: 'Stay motivated',
          body: 'Earn XP, unlock new levels, and keep your streak going to make learning a daily habit.',
          color: '#FFF3B3',
        },
        {
          emoji: '📱',
          title: 'Your progress everywhere',
          body: 'Your learning syncs across devices, so you can take Duolingo anywhere and pick up where you left off.',
          color: '#F4DCFF',
        },
      ].map((f, i) => (
        <section
          key={f.title}
          className={`py-16 px-6 ${i % 2 === 1 ? 'bg-[#F7F7F7]' : 'bg-white'}`}
        >
          <div className={`max-w-4xl mx-auto flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
            <div
              className="w-48 h-48 rounded-3xl flex items-center justify-center text-8xl flex-shrink-0"
              style={{ backgroundColor: f.color }}
            >
              {f.emoji}
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#3C3C3C] mb-4">{f.title}</h2>
              <p className="text-[#AFAFAF] font-bold text-lg leading-relaxed">{f.body}</p>
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section className="bg-[#58CC02] py-16 px-6 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Start learning for free today</h2>
        <p className="text-white/80 font-bold text-lg mb-8">Join millions of people learning something new</p>
        <Link to="/register" className="bg-white text-[#58CC02] font-black uppercase tracking-wider px-12 py-[14px] rounded-2xl border-b-4 border-white/50 hover:bg-[#F7F7F7] transition-colors inline-block text-xl">
          GET STARTED
        </Link>
      </section>

      <footer className="py-6 px-6 text-center text-[#AFAFAF] text-sm font-bold border-t border-[#E5E5E5]">
        © 2024 Duolingo Clone
      </footer>
    </div>
  );
}
