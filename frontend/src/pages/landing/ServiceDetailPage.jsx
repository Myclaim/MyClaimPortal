import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import FloatingActions from '../../components/landing/FloatingActions';
import { services } from '../../components/landing/WhatWeDo';

const detailBySlug = {
  'iepf-claims': {
    overview: 'When shares or dividends remain unclaimed for the prescribed period, they may be transferred to the Investor Education and Protection Fund (IEPF). Our team helps you trace the holding, prepare the claim, and follow it through the relevant verification steps.',
    support: ['Trace eligible shares and unpaid dividends', 'Prepare and review IEPF-5 claim paperwork', 'Coordinate document verification with the company and its RTA', 'Track follow-ups through the claim process'],
    steps: ['Share the company and folio details for an initial search', 'Gather and prepare identity, entitlement, and supporting records', 'Submit the claim and respond to verification requests'],
    documents: ['PAN and identity/address proof', 'Share or folio details and available certificates', 'Bank and demat account proof'],
  },
  'duplicate-share-certificates': {
    overview: 'If original share certificates are lost, damaged, or unavailable, we guide you through the company and registrar process to request replacement certificates or the applicable electronic credit.',
    support: ['Review folio and shareholder records', 'Prepare the required declarations and indemnity documents', 'Coordinate publication or police documentation when required', 'Follow up with the company or RTA'],
    steps: ['Confirm the holding and missing certificate details', 'Prepare and complete the required paperwork', 'Submit the request and track registrar verification'],
    documents: ['Folio or share certificate details', 'PAN and address proof', 'Police report, indemnity, or affidavit if requested'],
  },
  'demat-physical-shares': {
    overview: 'Convert eligible paper share certificates into electronic holdings in your demat account. We help coordinate the paperwork between you, your Depository Participant, and the company or RTA.',
    support: ['Review certificates and identify mismatches', 'Help prepare the Dematerialisation Request Form (DRF)', 'Coordinate submission and rectification requests', 'Track the request through to the demat account'],
    steps: ['Check certificates and demat account details', 'Complete and submit the DRF with the certificates', 'Respond to queries and confirm the electronic credit'],
    documents: ['Original share certificates', 'Completed DRF from your Depository Participant', 'PAN and demat account client master list'],
  },
  'share-transfer-transmission': {
    overview: 'We assist with ownership updates when shares need to be transferred or transmitted to eligible holders or legal heirs, including coordination with the company and its registrar.',
    support: ['Review the current holding and proposed ownership change', 'Identify transfer or transmission requirements', 'Prepare application forms and supporting records', 'Track company and RTA review'],
    steps: ['Review the case and the relationship of the new holder', 'Prepare the relevant forms and supporting documents', 'Submit the request and follow up on verification'],
    documents: ['Share and folio details', 'Identity and address proof of the relevant holders', 'Transfer deed or legal succession records, as applicable'],
  },
  'nri-shareholder-assistance': {
    overview: 'NRIs can manage Indian share and investment recovery with remote assistance. We help organize the paperwork, attestations, and communication needed to progress the case from abroad.',
    support: ['Review Indian share, folio, or investment records', 'Coordinate Power of Attorney and overseas attestation requirements', 'Help prepare NRE/NRO bank and demat details', 'Keep document and registrar follow-ups coordinated remotely'],
    steps: ['Share available investment and identity details remotely', 'Prepare and attest the required documents', 'Submit the case and track progress with the relevant institutions'],
    documents: ['Indian investment or folio details', 'Passport, PAN, and overseas address proof', 'Attested authorization and NRE/NRO or demat details, if applicable'],
  },
  'legal-heir-probate-support': {
    overview: 'Some investment claims require legal proof of succession. We help families understand and organize the paperwork requested for probate, succession certificates, or other legal heirship processes.',
    support: ['Review the institution’s stated legal requirements', 'Organize heirship and relationship records', 'Coordinate probate or succession documentation with legal professionals', 'Help prepare the related company or registrar submission'],
    steps: ['Review the family situation and the asset holder’s records', 'Identify the legal documents requested for the case', 'Coordinate preparation and submission of the claim documents'],
    documents: ['Death certificate of the original holder', 'Family and relationship records', 'Will, probate, succession certificate, or other available court records'],
  },
  'hereditary-claims': {
    overview: 'We help families identify and claim shares, dividends, and other investments left by a deceased family member, including cases where records are incomplete or spread across institutions.',
    support: ['Search available folio and investment records', 'Map heirs and the documents needed for the claim', 'Coordinate legal heirship and institution paperwork', 'Follow up with companies, RTAs, and relevant authorities'],
    steps: ['Collect the deceased holder’s known details and records', 'Trace the holdings and confirm the appropriate claim route', 'Prepare, submit, and follow up on the heir’s claim'],
    documents: ['Death certificate and identity proof', 'Family tree or relationship evidence', 'Share, folio, bank, or other investment records'],
  },
  'unclaimed-deposits-property': {
    overview: 'Forgotten deposits and property records can be difficult to locate. We help organize a search using the information available and guide you through the relevant institution’s claim requirements.',
    support: ['Review names, addresses, and account clues', 'Organize searches across available records and institutions', 'Identify the supporting documents requested for a claim', 'Coordinate follow-ups with the relevant bank or authority'],
    steps: ['Provide the known names, locations, and asset clues', 'Review potential matches and verify ownership evidence', 'Prepare and track the claim with the relevant institution'],
    documents: ['Account, deposit, or property details', 'Identity and address records of the holder or heirs', 'Ownership, relationship, or succession documents as applicable'],
  },
};

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);
  const details = detailBySlug[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!service || !details) {
    return (
      <div className="min-h-screen bg-white px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Service not found</h1>
        <Link to="/#what-we-do" className="mt-6 inline-flex font-semibold text-emerald-700 hover:text-emerald-800">Back to services</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1C1C1C]">
      <Header />
      <main>
        <section className="bg-[#F8FBF8] px-6 py-10 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-emerald-700">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/#what-we-do" className="hover:text-emerald-700">What We Do</Link>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-700">{service.title}</span>
            </nav>

            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <span className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">MyClaim service</span>
                <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{service.title}</h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">{details.overview}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="tel:+918511000454" className="rounded-full bg-[#2FBF71] px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-[#26aa62]">Talk to our team</a>
                  <Link to="/#what-we-do" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">All services</Link>
                </div>
              </div>
              <div className="hidden h-36 w-36 items-center justify-center rounded-3xl border border-emerald-100 bg-white text-[#55AE76] shadow-sm md:flex">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24">{service.icon}</svg>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-8">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">How we can help</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {details.support.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">✓</span>{item}</li>)}
                </ul>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">Typical process</h2>
                <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                  {details.steps.map((step, index) => <li key={step} className="rounded-xl bg-[#F8FBF8] p-4"><span className="text-xs font-extrabold text-emerald-700">STEP 0{index + 1}</span><p className="mt-2 text-sm leading-relaxed text-slate-600">{step}</p></li>)}
                </ol>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">Useful records to gather</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">The exact requirements depend on your case. These records are a helpful starting point:</p>
              <ul className="mt-5 space-y-3">
                {details.documents.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2FBF71]" />{item}</li>)}
              </ul>
              <a href="tel:+918511000454" className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#2FBF71] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#26aa62]">Discuss your case</a>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
