import { useState, useEffect } from 'react';
import { CircleUser } from 'lucide-react';
import { getAvatarUrl } from '../../services/api';

// Shared avatar: shows the user's uploaded profile image with a graceful
// fallback to a generic user icon (Navbar + AdminLayout).
const UserAvatar = ({ user, size = 30, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const src = getAvatarUrl(user?.profileImage);

  useEffect(() => {
    setImgFailed(false);
  }, [user?.profileImage]);

  if (!src || imgFailed) {
    return <CircleUser size={size} className={className} />;
  }

  return (
    <img
      src={src}
      alt={`${user?.name || 'User'} avatar`}
      onError={() => setImgFailed(true)}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover ${className}`}
    />
  );
};

export default UserAvatar;
