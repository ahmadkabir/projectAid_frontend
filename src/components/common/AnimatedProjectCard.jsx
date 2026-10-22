import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Package } from 'lucide-react';
import logo from '../../assets/logo.png';

const AnimatedProjectCard = ({ project }) => {
  const [imageError, setImageError] = useState(false);
  const hasThumbnail = project.thumbnail && !imageError;
  const thumbnailUrl = hasThumbnail 
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/thumbnails/${project.thumbnail}`
    : null;

  // Use new unified price field if available, otherwise fall back to legacy price fields
  const minPrice = project.price 
    ? parseFloat(project.price)
    : Math.min(
        project.documentationPrice || Infinity,
        project.softwarePrice || Infinity,
        project.fullProjectPrice || Infinity
      );

  const isAvailable = project.status === 'published' || project.status === 'active';

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative block h-full"
    >
      <div className="relative h-full bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.03]">
        {/* Card Image/Background Section */}
        <div className="relative h-64 overflow-hidden">
          {/* Thumbnail Image or Animated Background */}
          {hasThumbnail ? (
            <>
              <img
                src={thumbnailUrl}
                alt={project.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />
            </>
          ) : (
            <>
              {/* Animated Logo Background */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary-blue via-primary-blue-light to-primary-green opacity-10 group-hover:opacity-15 animated-logo-bg group-hover:animated-logo-bg-hover transition-opacity duration-300"
                style={{
                  backgroundImage: `url(${logo})`,
                  backgroundSize: '350px 350px',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 animated-shimmer group-hover:animated-shimmer-fast transition-opacity duration-300" />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/85 group-hover:via-black/55 transition-all duration-300" />
            </>
          )}

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
            {/* Course Badge */}
            <div className="mb-3">
              <span className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30">
                <BookOpen size={12} />
                <span>{project.category?.name || 'Uncategorized'}</span>
              </span>
            </div>

            {/* Project Title */}
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:translate-y-[-2px] transition-transform duration-300">
              {project.title}
            </h3>

            {/* Availability and software badges */}
            <div className="flex flex-wrap items-center gap-2">
              {project.hasSoftware && (
                <span className="inline-flex items-center space-x-1 bg-primary-blue/90 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                  <Package size={12} />
                  <span>{project.softwareSaleMode === 'included' ? 'Software included' : 'Software available'}</span>
                </span>
              )}
              {isAvailable ? (
                <span className="inline-flex items-center space-x-1 bg-primary-green/90 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                  <CheckCircle size={12} />
                  <span>Available</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 bg-gray-600/90 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                  <XCircle size={12} />
                  <span>Unavailable</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Description - use summary if available, otherwise description */}
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
            {project.summary || project.description || 'No description available'}
          </p>

          {/* Price and Action */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Starting from</span>
              <span className="text-xl font-bold text-primary-blue">
                {minPrice !== Infinity ? `₦${minPrice.toFixed(2)}` : 'Free'}
              </span>
            </div>
            <div className="text-primary-blue group-hover:text-primary-green transition-colors duration-300">
              <span className="text-sm font-semibold group-hover:translate-x-1 inline-block transition-transform duration-300">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimatedProjectCard;
