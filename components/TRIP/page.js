import TripDashboard from "../../components/TripDashboard";
import DriverNavbar from "../../components/DriverNavbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Live Trip Dashboard — CampusTrack",
  description: "Live driver interface for managing and tracking active trips.",
};

export default function TripPage() {
  return (
    <main className="min-h-screen bg-slate-50 antialiased flex flex-col">
      <DriverNavbar />
      
      <div className="flex-1 pt-32 pb-10 lg:pt-36 lg:pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <TripDashboard />
      </div>

      <Footer />
    </main>
  );
}
