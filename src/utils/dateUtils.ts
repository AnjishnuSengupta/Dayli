
/**
 * Formats the duration between two dates in YY:MM:DD format
 * @param startDate - The start date of the relationship
 * @param endDate - The end date (usually today's date)
 * @returns A formatted string in YY:MM:DD format
 */
export const formatRelationshipDuration = (startDate: Date, endDate: Date = new Date()): string => {
  // Ensure we're working with valid dates
  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "00:00:00";
  }

  // Ensure start date is before end date
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastDayOfPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    days += lastDayOfPreviousMonth;
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Format with leading zeros
  const formattedYears = years.toString().padStart(2, '0');
  const formattedMonths = months.toString().padStart(2, '0');
  const formattedDays = days.toString().padStart(2, '0');

  return `${formattedYears}:${formattedMonths}:${formattedDays}`;
};

/**
 * Gets a human-readable description of the relationship duration
 * @param startDate - The start date of the relationship
 * @param endDate - The end date (usually today's date)
 * @returns A human-readable string describing the duration
 */
export const getRelationshipDurationText = (startDate: Date, endDate: Date = new Date()): string => {
  const duration = formatRelationshipDuration(startDate, endDate);
  const [years, months, days] = duration.split(':').map(Number);

  if (years > 0) {
    if (months === 0 && days === 0) {
      return years === 1 ? '1 year' : `${years} years`;
    } else if (months === 0) {
      return years === 1 ? `1 year and ${days} days` : `${years} years and ${days} days`;
    } else if (days === 0) {
      return years === 1 ? `1 year and ${months} months` : `${years} years and ${months} months`;
    } else {
      return years === 1 
        ? `1 year, ${months} months, and ${days} days` 
        : `${years} years, ${months} months, and ${days} days`;
    }
  } else if (months > 0) {
    if (days === 0) {
      return months === 1 ? '1 month' : `${months} months`;
    } else {
      return months === 1 ? `1 month and ${days} days` : `${months} months and ${days} days`;
    }
  } else {
    return days === 1 ? '1 day' : `${days} days`;
  }
};

/**
 * Calculates the total number of days between two dates
 * @param startDate - The start date
 * @param endDate - The end date (usually today's date)
 * @returns The total number of days as a number
 */
export const getTotalDays = (startDate: Date, endDate: Date = new Date()): number => {
  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
