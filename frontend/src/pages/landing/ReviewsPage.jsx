import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import FloatingActions from '../../components/landing/FloatingActions';

const sampleReviews = [
  { name: 'Sample Client 01', initials: 'S1', service: 'IEPF Claims', date: 'Demo entry', text: 'The team explained the IEPF claim steps in a clear order and helped me understand which documents to prepare before submitting the request.' },
  { name: 'Sample Client 02', initials: 'S2', service: 'Demat of Physical Shares', date: 'Demo entry', text: 'I was unsure how to start converting old paper certificates. The process was broken into manageable steps, and my questions were answered along the way.' },
  { name: 'Sample Client 03', initials: 'S3', service: 'NRI Assistance', date: 'Demo entry', text: 'Coordinating paperwork from overseas felt complicated at first. Having a checklist and a single point of contact made the next steps easier to follow.' },
  { name: 'Sample Client 04', initials: 'S4', service: 'Legal Heir Support', date: 'Demo entry', text: 'The guidance helped our family understand which succession records might be needed and how to organize the information for the claim.' },
  { name: 'Sample Client 05', initials: 'S5', service: 'Duplicate Share Certificates', date: 'Demo entry', text: 'I received a helpful overview of the replacement certificate process and the kinds of forms and supporting records the registrar may request.' },
  { name: 'Sample Client 06', initials: 'S6', service: 'Hereditary Claims', date: 'Demo entry', text: 'The team helped us put the known investment details and family documents in order, making the claim requirements easier to understand.' },
  { name: 'Sample Client 07', initials: 'S7', service: 'Share Transfer', date: 'Demo entry', text: 'The ownership transfer requirements were explained in plain language, and I knew what information to gather before moving forward.' },
  { name: 'Sample Client 08', initials: 'S8', service: 'Unclaimed Assets', date: 'Demo entry', text: 'The initial conversation gave me a practical way to organize old account details and identify what could be checked next.' },
];

const filters = ['All Reviews', ...new Set(sampleReviews.map((review) => review.service))];

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState('All Reviews');
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const visibleReviews = useMemo(
    () => activeFilter === 'All Reviews' ? sampleReviews : sampleReviews.filter((review) => review.service === activeFilter),
    [activeFilter]
  );

  return (
    <div className="min-h-screen bg-white text-[#1C1C1C]">
      <Header />
      <main>
        <section className="bg-[#F8FBF8] px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-6xl text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">Client feedback</span>
            <h1 className="mx-auto mt-5 max-w-4xl font-serif text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">Stories from the claim journey</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">See how clear guidance and organized support can make complex recovery steps easier to navigate.</p>
            <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-3 shadow-sm">
              <span className="text-2xl tracking-wide text-amber-400" aria-label="Five sample stars">★★★★★</span>
              <span className="text-left text-sm font-semibold text-slate-700">Review page preview</span>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              <strong>Fictional demo reviews:</strong> These sample names and comments are placeholder content for page design only. They are not actual customer statements or verified reviews.
            </div>

            <div className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter sample reviews">
              {filters.map((filter) => (
                <button key={filter} type="button" onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === filter ? 'bg-[#2FBF71] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleReviews.map((review) => (
                <article key={review.initials} className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,0.04)] transition hover:border-emerald-200 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">{review.initials}</span>
                      <div>
                        <h2 className="font-bold text-slate-900">{review.name}</h2>
                        <p className="text-xs text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">Sample</span>
                  </div>
                  <div className="mt-5 text-lg tracking-wider text-amber-400" aria-label="Five sample stars">★★★★★</div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">“{review.text}”</p>
                  <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">{review.service}</div>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500">Want to share feedback about your experience?</p>
              <a href="mailto:info@myclaimindia.com?subject=MyClaim%20India%20Feedback" className="mt-3 inline-flex rounded-full bg-[#2FBF71] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#26aa62]">Contact our team</a>
              <div><Link to="/#testimonials" className="mt-5 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800">Back to testimonials</Link></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
