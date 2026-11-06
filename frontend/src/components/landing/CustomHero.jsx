import React from 'react';

/**
 * CustomHero – reusable hero section.
 * Displays a background image (placed in `frontend/public/images/custom-hero.jpg`).
 * A top‑center CTA button "Start your free claim check" appears above the main heading.
 * Optional heading, sub‑heading and a secondary CTA button can be customized via props.
 */
export default function CustomHero({
  title = 'Welcome to MyClaim',
  subtitle = 'Your claims, simplified',
  buttonText = 'Get Started',
  onButtonClick,
}) {
  return (
    <section className="relative w-full h-[80vh] bg-gray-900 flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/custom-hero.jpg')" }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black opacity-60" />

      {/* Top CTA button */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
        <button
          onClick={onButtonClick}
          className="inline-flex items-center gap-2 bg-white text-[#2FBF71] font-semibold py-2 px-4 rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          Start your free claim check
        </button>
      </div>

      <div className="relative z-10 text-center max-w-3xl px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-8">
          {subtitle}
        </p>
        {buttonText && (
          <button
            onClick={onButtonClick}
            className="inline-flex items-center gap-2 bg-[#2FBF71] hover:bg-[#26aa62] text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-colors"
          >
            {buttonText}
          </button>
        )}
      </div>
    </section>
  );
}

