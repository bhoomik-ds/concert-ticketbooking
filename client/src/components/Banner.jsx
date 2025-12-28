const Banner = () => {
  return (
    <div className="relative w-full h-64 md:h-200 bg-gray-900">
      <img
        src="/images/background.png"
       alt="Event Banner"
        className="w-full h-full object-top opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent"></div>
    </div>
//bg-gradient-to-t from-black/60 to-transparent
  );
};

export default Banner;