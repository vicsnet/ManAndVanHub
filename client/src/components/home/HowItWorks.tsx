import { SearchIcon, ClipboardCheckIcon, TruckIcon } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-12 md:py-16 bg-slate-50" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">How Man & Van Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Quick and easy steps to find and book the perfect van service for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600/10 to-indigo-700/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Search</h3>
            <p className="text-slate-600">
              Enter your location, date, and van size requirements to find available services in your
              area.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600/10 to-indigo-700/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheckIcon className="text-indigo-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-indigo-700">Book</h3>
            <p className="text-slate-600">
              Choose from available van services based on price, reviews, and specifications to match
              your needs.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600/10 to-indigo-700/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Move</h3>
            <p className="text-slate-600">
              Your driver arrives at the scheduled time to help with your move or delivery needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
