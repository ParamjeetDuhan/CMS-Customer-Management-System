function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16 md:mt-32">
      
      {/* Badge/Eyebrow text */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 shadow-sm">
        <span>Tailwind Working</span>
        <span>🚀</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
        Welcome to <br className="md:hidden" />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          CMS Platform
        </span> 🚀✨
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
        Discover nearby shops and order products easily right from your neighborhood.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-full transition-colors shadow-md hover:shadow-lg">
          Explore Shops
        </button>
        <button className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-medium px-8 py-3 rounded-full transition-colors shadow-sm hover:shadow-md">
          Learn More
        </button>
      </div>

    </div>
  );
}

export default Home;