import { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Package } from 'lucide-react';
import logo from '../../assets/logo.png';

const AnimatedHeroSection = ({ 
  project, 
  imageUrl, 
  onImageError,
  showAvailability = true,
  showPrice = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const hasThumbnail = imageUrl && !imageError && !onImageError;

  const handleImageError = () => {
    setImageError(true);
    if (onImageError) onImageError();
  };

  const optionPrices = (project?.purchaseOptions || []).map((option) => Number(option.price)).filter((price) => price > 0);
  const minPrice = optionPrices.length > 0
    ? Math.min(...optionPrices)
    : project
      ? Math.min(
          project.documentationPrice || project.price || Infinity,
          project.softwarePrice || Infinity,
          project.fullProjectPrice || Infinity
        )
      : Infinity;

  const isAvailable = project?.status === 'published' || project?.status === 'active';

  const getProjectTypes = () => {
    if (!project) return [];
    const types = [];
    if (project.documentationPrice > 0 || project.price > 0) types.push('Documentation');
    if (project.hasSoftware) {
      types.push(project.softwareSaleMode === 'included' ? 'Documentation + Software' : 'Software available separately');
    }
    return types;
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-xl shadow-xl">
      {/* Thumbnail Image or Animated Background */}
      {hasThumbnail ? (
        <>
          <img
            src={imageUrl}
            alt={project?.title || 'Project'}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </>
      ) : (
        <>
          {/* Animated Logo Background */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary-blue via-primary-blue-light to-primary-green opacity-10 animated-logo-bg"
            style={{
              backgroundImage: `url(${logo})`,
              backgroundSize: '600px 600px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 opacity-20 animated-shimmer" />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />
        </>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 z-10">
        <div className="max-w-4xl">
          {/* Course Badge */}
          {project?.category && (
            <div className="mb-4">
              <span className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                <BookOpen size={14} />
                <span>{project.category.name}</span>
              </span>
            </div>
          )}

          {/* Project Type Badges */}
          {getProjectTypes().length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {getProjectTypes().map((type, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30"
                >
                  <Package size={14} />
                  <span>{type}</span>
                </span>
              ))}
            </div>
          )}

          {/* Project Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {project?.title || 'Project Title'}
          </h1>

          {/* Availability and Price Row */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {showAvailability && (
              <>
                {isAvailable ? (
                  <span className="inline-flex items-center space-x-2 bg-primary-green/90 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                    <CheckCircle size={16} />
                    <span>Available</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-2 bg-gray-600/90 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                    <XCircle size={16} />
                    <span>Unavailable</span>
                  </span>
                )}
              </>
            )}
            
            {showPrice && minPrice !== Infinity && (
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30">
                <div className="text-xs text-white/80 mb-1">Starting from</div>
                <div className="text-3xl font-bold text-white">
                  ₦{minPrice.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeroSection;
