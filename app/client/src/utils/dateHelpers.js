import { format, startOfMonth, endOfMonth, startOfWeek, differenceInDays, isSameDay, subDays } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

export const formatTime = (time) => {
  if (!time) return '-';
  return format(new Date(`2000-01-01T${time}`), 'hh:mm a');
};

export const getToday = () => format(new Date(), 'yyyy-MM-dd');

export const getCurrentMonth = () => new Date().getMonth() + 1;

export const getCurrentYear = () => new Date().getFullYear();

export const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
};

export const getWeekDates = () => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(format(new Date(weekStart.getTime() + i * 86400000), 'yyyy-MM-dd'));
  }
  return dates;
};

export const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: format(d, 'MMM yyyy'),
    });
  }
  return months;
};

export const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

export const calculateStreak = (visitDates) => {
  if (!visitDates || visitDates.length === 0) return 0;
  
  const sortedDates = [...new Set(visitDates.map(d => format(new Date(d), 'yyyy-MM-dd')))].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  let streak = 0;
  let checkDate = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (sortedDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    checkDate = subDays(checkDate, 1);
  }
  
  return streak;
};

export const getAchievementColor = (percentage) => {
  if (percentage >= 100) return 'text-green-600';
  if (percentage >= 50) return 'text-amber-600';
  return 'text-red-600';
};

export const getAchievementBg = (percentage) => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};