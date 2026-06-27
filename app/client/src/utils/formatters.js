export const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone;
};

export const formatPurpose = (purpose) => {
  const purposes = {
    FOLLOW_UP: 'Follow Up',
    NEW_BUSINESS: 'New Business',
    COMPLAINT: 'Complaint',
    DEMO: 'Demo',
    PAYMENT_COLLECTION: 'Payment Collection',
    RELATIONSHIP_VISIT: 'Relationship Visit',
    OTHER: 'Other',
  };
  return purposes[purpose] || purpose;
};

export const formatStatus = (status) => {
  const statuses = {
    COMPLETED: 'Completed',
    PLANNED: 'Planned',
    CANCELLED: 'Cancelled',
  };
  return statuses[status] || status;
};

export const formatCategory = (category) => {
  const categories = {
    PLATINUM: 'Platinum',
    GOLD: 'Gold',
    SILVER: 'Silver',
    GENERAL: 'General',
  };
  return categories[category] || category;
};

export const getStatusColor = (status) => {
  const colors = {
    COMPLETED: 'bg-green-100 text-green-800',
    PLANNED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getCategoryColor = (category) => {
  const colors = {
    PLATINUM: 'bg-purple-100 text-purple-800',
    GOLD: 'bg-yellow-100 text-yellow-800',
    SILVER: 'bg-gray-100 text-gray-800',
    GENERAL: 'bg-blue-100 text-blue-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    ADMIN: 'bg-red-100 text-red-800',
    BM: 'bg-blue-100 text-blue-800',
    SALESMAN: 'bg-green-100 text-green-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};