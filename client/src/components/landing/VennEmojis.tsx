return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto">
        {/* Left circle (base shape for intersection) */}
        <motion.div 
          className={`absolute left-1/3 w-36 h-36 md:w-48 md:h-48 rounded-full 
                     bg-gradient-to-br ${slide.colors.circle1} flex items-center justify-center 
                     opacity-70 border-2 border-white/50 shadow-xl`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Right circle (base shape for intersection) */}
        <motion.div 
          className={`absolute left-1/4 w-36 h-36 md:w-48 md:h-48 rounded-full 
                     bg-gradient-to-br ${slide.colors.circle2} flex items-center justify-center 
                     opacity-70 border-2 border-white/50 shadow-xl`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Intersection mask - this creates the overlapping area effect */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Left label */}
          <motion.div 
            className="absolute left-[15%] flex flex-col items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-4xl md:text-5xl drop-shadow-lg">{slide.emoji1}</span>
            <span className="text-sm md:text-base mt-1 font-medium text-white drop-shadow-md">{slide.label1}</span>
          </motion.div>

          {/* Right label */}
          <motion.div 
            className="absolute right-[15%] flex flex-col items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-4xl md:text-5xl drop-shadow-lg">{slide.emoji2}</span>
            <span className="text-sm md:text-base mt-1 font-medium text-white drop-shadow-md">{slide.label2}</span>
          </motion.div>

          {/* Intersection (center) */}
          <motion.div 
            className="relative w-20 h-32 md:w-28 md:h-40 flex items-center justify-center z-30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative flex flex-col items-center">
              <span className="text-3xl md:text-4xl drop-shadow-lg">{slide.fusionEmoji}</span>
              <span className="text-xs md:text-sm mt-1 font-medium text-white drop-shadow-md text-center">{slide.fusionLabel}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );