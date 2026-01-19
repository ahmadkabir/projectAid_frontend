// Frontend course validation utilities
// Enforces course-based project type restrictions

export const SOFTWARE_ALLOWED_COURSES = [
  'Computer Science',
  'Computer Engineering'
];

/**
 * Check if a course allows software/full projects
 * @param {string} courseName - Name of the course
 * @returns {boolean} - True if course allows software projects
 */
export const allowsSoftwareProjects = (courseName) => {
  return SOFTWARE_ALLOWED_COURSES.includes(courseName);
};

/**
 * Get allowed project types for a course
 * @param {string} courseName - Name of the course
 * @returns {array} - Array of allowed project types
 */
export const getAllowedProjectTypes = (courseName) => {
  if (allowsSoftwareProjects(courseName)) {
    return ['documentation', 'software', 'full'];
  }
  return ['documentation'];
};
