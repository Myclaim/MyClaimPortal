import React from 'react';
import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import StatsBar from '../../components/landing/StatsBar';
import WhatWeDo from '../../components/landing/WhatWeDo';
import Process from '../../components/landing/Process';
import Testimonials from '../../components/landing/Testimonials';
import FAQ from '../../components/landing/FAQ';
import Footer from '../../components/landing/Footer';
import FloatingActions from '../../components/landing/FloatingActions';

export default function LandingPage({ onOpenLogin }) {
  return (
    <div className="font-sans bg-white min-h-screen text-[#1C1C1C] selection:bg-[#2FBF71] selection:text-white">
      <Header onOpenLogin={onOpenLogin} />
      <main id="main-content">
        {/* 1) Hero (Rotating Words, Mobile Screen Lead Form, Reviews Card) */}
        <Hero />

        {/* 6-Metric Stats Bar */}
        <StatsBar />

        {/* 2) Approach of What We Do */}
        <WhatWeDo />

        {/* 3) Our Claim Process & Who We Collab With */}
        <Process />

        {/* 4) Client & Partner Testimonials */}
        <Testimonials />

        {/* 5) FAQs (For Clients & For Partners) */}
        <FAQ />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
