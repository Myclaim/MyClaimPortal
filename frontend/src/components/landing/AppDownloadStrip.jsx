const googlePlaySearch = 'https://play.google.com/store/search?q=MyClaim%20India&c=apps';
const appStoreSearch = 'https://apps.apple.com/in/search?term=MyClaim%20India';

export default function AppDownloadStrip() {
  return (
    <section className="w-full bg-transparent px-2 py-4">
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-3">
        <p className="text-center text-lg font-medium text-slate-700 sm:text-xl">Download MyClaim App</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href={googlePlaySearch} target="_blank" rel="noopener noreferrer" aria-label="Search MyClaim India on Google Play"
            className="flex min-w-[158px] items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-white transition hover:bg-slate-800">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
              <path d="M4 3.5v17l9-8.5L4 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m13 12 3.1-3 3.6 2.1c.7.4.7 1.4 0 1.8l-3.6 2.1L13 12Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="m4 3.5 12.1 5.6M4 20.5l12.1-5.6" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="text-sm font-semibold">Google Play</span>
          </a>

          <a href={appStoreSearch} target="_blank" rel="noopener noreferrer" aria-label="Search MyClaim India on the App Store"
            className="flex min-w-[158px] items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-white transition hover:bg-slate-800">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="m12 7 5.4 9.4M9.4 11.5l5.2-9M4 16.4h15.5M7.2 21l3.4-5.8M16.8 21l-1.5-2.6" />
              <path d="M6 16.4 3.8 20M18 16.4l2.2 3.6" />
            </svg>
            <span className="text-sm font-semibold">App Store</span>
          </a>
        </div>
      </div>
    </section>
  );
}
