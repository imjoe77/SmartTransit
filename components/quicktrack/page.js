import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuickTrackBanner from '../components/QuickTrackBanner';
import TrackingWidget from '../components/TrackingWidget';

export const metadata = {
  title: 'QuickTrack - Live GPS Bus Tracking | Smart Transit',
  description: 'Live GPS bus tracking for bus companies and campuses. Select your company and track buses in real-time.',
};

export default function QuickTrackPage() {
  return (
    <main className="min-h-screen bg-slate-50 antialiased flex flex-col">
      <Navbar />
      
      {/* Banner Section */}
      <QuickTrackBanner />
      
      {/* Tracking Widget Section - overlaps the banner visually */}
      <div className="flex-grow px-4 pb-20 relative -mt-24 z-20">
        <TrackingWidget />
      </div>

      <Footer />
    </main>
  );
}
