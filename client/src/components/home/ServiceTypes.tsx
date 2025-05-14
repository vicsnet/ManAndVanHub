import { Link } from "wouter";

const ServiceTypes = () => {
  const services = [
    {
      title: "House & Flat Moves",
      description: "Full service moving for homes of all sizes",
      image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
      searchParams: "?serviceType=house-moves",
    },
    {
      title: "Furniture Delivery",
      description: "Safe transport for new furniture purchases",
      image: "https://pixabay.com/get/gd02259dea51dcfc3813dee74f0d73d41bdf5e84caba0d996eaa20fc58f16feb388bb767353f99e367833eb3890c2daadf7892faca21416080140a17b01a33a32_1280.jpg",
      searchParams: "?serviceType=furniture",
    },
    {
      title: "Office Relocations",
      description: "Professional business moving services",
      image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
      searchParams: "?serviceType=office-moves",
    },
    {
      title: "Single Item Transport",
      description: "Quick and affordable small item delivery",
      image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
      searchParams: "?serviceType=single-item",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">Our Services</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From furniture delivery to full house moves, our van drivers provide a wide range of
            services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link href={`/search${service.searchParams}`} key={index}>
              <div className="relative rounded-lg overflow-hidden group h-64 shadow-md cursor-pointer">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-75"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm">{service.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceTypes;
