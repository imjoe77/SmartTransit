import TripHistory from "../../components/TripHistory";
import DriverNavbar from "../../components/DriverNavbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Trip History Dashboard — CampusTrack",
  description: "View past trips, routes, durations, and driver performance history.",
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 antialiased flex flex-col font-sans relative">
      <DriverNavbar />
      
      {/* Dynamic padding correctly applied to clear the fixed global navbar */}
      <div className="flex-1 pt-32 pb-12 lg:pt-36 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full z-10">
        <TripHistory />
      </div>

      <Footer />
    </main>
  );
}
