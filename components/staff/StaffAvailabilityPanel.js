import { useState, useMemo, useEffect } from "react";

export default function StaffAvailabilityPanel({
  shows,
  loadingShows,
  selectedShowId,
  dateOptions,
  selectedDates,
  availabilitySaving,
  availabilityError,
  availabilityHistory,
  hasSubmittedForSelectedShow,
  onShowChange,
  onToggleDate,
  onSubmit,
  staffName,
  staffBookings = [],
  payRate,
  staffCity,
}) {
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [locationFilter, setLocationFilter] = useState("all");
  const [scheduleView, setScheduleView] = useState("upcoming"); // "upcoming" | "past"

  // Get unique locations from shows
  const locationOptions = useMemo(() => {
    const locations = new Set();
    shows.forEach((show) => {
      if (show.location) {
        // Extract city from location (e.g., "New York, NY" -> "New York")
        const city = show.location.split(",")[0].trim();
        locations.add(city);
      }
    });
    return Array.from(locations).sort();
  }, [shows]);

  // Set default location filter to staff's city if it matches available locations
  useEffect(() => {
    if (staffCity && locationOptions.length > 0) {
      const staffCityLower = staffCity.toLowerCase().trim();
      const matchingLocation = locationOptions.find(
        (loc) => loc.toLowerCase().includes(staffCityLower) || staffCityLower.includes(loc.toLowerCase())
      );
      if (matchingLocation) {
        setLocationFilter(matchingLocation);
      }
    }
  }, [staffCity, locationOptions]);

  // Filter shows by location
  const filteredShows = useMemo(() => {
    if (locationFilter === "all") return shows;
    return shows.filter((show) => {
      if (!show.location) return false;
      const showCity = show.location.split(",")[0].trim();
      return showCity === locationFilter;
    });
  }, [shows, locationFilter]);

  // Calculate stats from bookings and availability
  const stats = useMemo(() => {
    const showsWorked = staffBookings.length;
    
    // Count total booked days - use assignedDates which contains only dates where THIS staff is scheduled
    let daysBooked = 0;
    staffBookings.forEach((booking) => {
      if (Array.isArray(booking.assignedDates)) {
        daysBooked += booking.assignedDates.length;
      }
    });
    
    return { showsWorked, daysBooked };
  }, [staffBookings]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDateLabel = (value) => {
    if (!value || typeof value !== "string") return value;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortDate = (value) => {
    if (!value || typeof value !== "string") return value;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get days until show starts
  const getDaysUntil = (startDate) => {
    if (!startDate) return null;
    const start = new Date(`${startDate}T00:00:00`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Get urgency badge for show
  const getShowBadge = (show) => {
    const daysUntil = getDaysUntil(show.startDate);
    const hasSubmitted = availabilityHistory.some((entry) => entry.showId === show.id);
    
    if (hasSubmitted) {
      return { text: "Submitted", color: "bg-green-100 text-green-700", icon: "check" };
    }
    if (daysUntil !== null && daysUntil <= 3 && daysUntil >= 0) {
      return { text: `${daysUntil === 0 ? "Today" : daysUntil + "d left"}`, color: "bg-red-100 text-red-700", icon: "urgent" };
    }
    if (daysUntil !== null && daysUntil <= 7 && daysUntil > 3) {
      return { text: "Closing soon", color: "bg-amber-100 text-amber-700", icon: "clock" };
    }
    if (daysUntil !== null && daysUntil > 30) {
      return { text: "New", color: "bg-blue-100 text-blue-700", icon: "new" };
    }
    return null;
  };

  // Parse date for calendar view
  const getCalendarData = () => {
    if (!dateOptions.length) return null;
    
    const dates = dateOptions.map((opt) => {
      const date = new Date(`${opt.value}T00:00:00`);
      return {
        value: opt.value,
        day: date.getDate(),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      };
    });
    
    return dates;
  };

  const calendarDates = getCalendarData();
  const selectedShow = shows.find((s) => s.id === selectedShowId);

  return (
    <div className="space-y-6">
      {/* Welcome Section with Stats */}
      <div className="rounded-2xl bg-gradient-to-br from-sa-pinkLight via-pink-50 to-white p-5 ring-1 ring-sa-pink/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-sa-navy sm:text-xl">
              {getGreeting()}{staffName ? `, ${staffName.split(" ")[0]}` : ""}! 👋
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-white/80 px-4 py-3 text-center shadow-sm ring-1 ring-slate-100 sm:flex-initial sm:min-w-[100px]">
              <p className="text-2xl font-bold text-sa-pink">{stats.showsWorked}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-sa-slate">Shows Worked</p>
            </div>
            <div className="flex-1 rounded-xl bg-white/80 px-4 py-3 text-center shadow-sm ring-1 ring-slate-100 sm:flex-initial sm:min-w-[100px]">
              <p className="text-2xl font-bold text-sa-navy">{stats.daysBooked}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-sa-slate">Days Booked</p>
            </div>
            {payRate && (
              <div className="flex-1 rounded-xl bg-white/80 px-4 py-3 text-center shadow-sm ring-1 ring-slate-100 sm:flex-initial sm:min-w-[100px]">
                <p className="text-2xl font-bold text-green-600">${payRate}<span className="text-sm font-medium">/hr</span></p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-sa-slate">Pay Rate</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sa-pink to-[#ff5fa8] shadow-lg shadow-sa-pink/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-sa-navy">
                Share Your Availability
              </h2>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowFaqModal(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-sa-slate ring-1 ring-slate-100 transition-all hover:bg-white hover:shadow-sm hover:ring-sa-pink/30"
          >
            <svg className="h-4 w-4 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">FAQ</span>
          </button>
        </div>

        {/* FAQ Modal */}
        {showFaqModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFaqModal(false)}
            />
            <div className="relative w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sa-pinkLight to-pink-100">
                  <svg className="h-5 w-5 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-sa-navy">Show Day Info</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-sa-pink shadow-sm">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sa-navy">Work Hours</p>
                    <p className="mt-0.5 text-sm text-sa-slate">Days are 9 AM – 6 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-sa-pink shadow-sm">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sa-navy">Badge Pickup</p>
                    <p className="mt-0.5 text-sm text-sa-slate">The agency requests your badge for pickup</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-sa-pink shadow-sm">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sa-navy">First Day</p>
                    <p className="mt-0.5 text-sm text-sa-slate">Please arrive early on your first day</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-sa-pink to-[#ff5fa8] py-3 text-sm font-semibold text-white shadow-lg shadow-sa-pink/25 transition hover:shadow-xl"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* Show Selection Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Show Selector */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sa-navy">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-sa-pink to-[#ff5fa8] text-[10px] font-bold text-white shadow-sm">
                  1
                </span>
                Select Show
              </label>
              
              {/* Location Filter */}
              {locationOptions.length > 1 && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-sa-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-sa-navy outline-none transition focus:border-sa-pink focus:ring-2 focus:ring-sa-pink/20"
                  >
                    <option value="all">All Locations</option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {loadingShows ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                <svg className="h-5 w-5 animate-spin text-sa-pink" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-sa-slate">Loading shows...</span>
              </div>
            ) : filteredShows.length === 0 ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-6 text-center">
                <svg className="mx-auto h-10 w-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-amber-800">
                  {locationFilter !== "all" ? `No Shows in ${locationFilter}` : "No Active Shows"}
                </p>
                <p className="mt-1 text-xs text-amber-600">
                  {locationFilter !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setLocationFilter("all")}
                      className="underline hover:text-amber-700"
                    >
                      View all locations
                    </button>
                  ) : (
                    "Check back soon for new opportunities."
                  )}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredShows.map((show) => {
                  const isSelected = selectedShowId === show.id;
                  const badge = getShowBadge(show);
                  const daysUntil = getDaysUntil(show.startDate);
                  
                  return (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => onShowChange(show.id)}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                        isSelected
                          ? "border-sa-pink bg-gradient-to-br from-sa-pinkLight/80 to-pink-50 shadow-lg shadow-sa-pink/10 scale-[1.02]"
                          : "border-slate-100 bg-white hover:border-sa-pink/30 hover:shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      {/* Badge */}
                      {badge && (
                        <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                          {badge.icon === "check" && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {badge.icon === "urgent" && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                            </svg>
                          )}
                          {badge.icon === "clock" && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                            </svg>
                          )}
                          {badge.text}
                        </span>
                      )}
                      
                      <p className={`pr-16 text-sm font-semibold transition-colors ${isSelected ? "text-sa-pink" : "text-sa-navy group-hover:text-sa-pink"}`}>
                        {show.name || "Untitled show"}
                      </p>
                      
                      {show.startDate && show.endDate && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-sa-slate">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatShortDate(show.startDate)} – {formatShortDate(show.endDate)}
                        </div>
                      )}
                      
                      {show.location && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-sa-slate">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {show.location}
                        </div>
                      )}

                      {/* Selection indicator */}
                      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sa-pink to-[#ff5fa8] transition-transform duration-300 ${isSelected ? "scale-x-100" : "scale-x-0"}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar-Style Date Selection */}
          {selectedShowId && calendarDates && calendarDates.length > 0 && (
            <div className="animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sa-navy">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-sa-pink to-[#ff5fa8] text-[10px] font-bold text-white shadow-sm">
                    2
                  </span>
                  Select Available Dates
                </label>
                <span className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedDates.length > 0 
                    ? "bg-sa-pinkLight text-sa-pink" 
                    : "bg-slate-100 text-sa-slate"
                }`}>
                  {selectedDates.length} of {calendarDates.length} selected
                </span>
              </div>

              {/* Quick actions */}
              {!hasSubmittedForSelectedShow && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      calendarDates.forEach((d) => {
                        if (!selectedDates.includes(d.value)) {
                          onToggleDate(d.value);
                        }
                      });
                    }}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-sa-slate transition hover:bg-sa-pinkLight hover:text-sa-pink"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      selectedDates.forEach((d) => onToggleDate(d));
                    }}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-sa-slate transition hover:bg-slate-200"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Calendar Grid */}
              <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
                {selectedShow && (
                  <p className="mb-3 text-center text-sm font-medium text-sa-navy">
                    {new Date(`${selectedShow.startDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                )}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {calendarDates.map((date) => {
                    const isChecked = selectedDates.includes(date.value);
                    const isDisabled = hasSubmittedForSelectedShow;
                    
                    return (
                      <button
                        key={date.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && onToggleDate(date.value)}
                        className={`group relative flex flex-col items-center rounded-xl p-3 transition-all duration-200 ${
                          isChecked
                            ? "bg-gradient-to-br from-sa-pink to-[#ff5fa8] text-white shadow-lg shadow-sa-pink/20 scale-105"
                            : date.isWeekend
                            ? "bg-slate-100/80 text-sa-navy hover:bg-sa-pinkLight hover:scale-105"
                            : "bg-white text-sa-navy ring-1 ring-slate-100 hover:ring-sa-pink/30 hover:scale-105"
                        } ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <span className={`text-[10px] font-medium ${isChecked ? "text-white/80" : "text-sa-slate"}`}>
                          {date.weekday}
                        </span>
                        <span className={`mt-0.5 text-lg font-bold ${isChecked ? "text-white" : ""}`}>
                          {date.day}
                        </span>
                        <span className={`text-[10px] ${isChecked ? "text-white/80" : "text-sa-slate"}`}>
                          {date.month}
                        </span>
                        
                        {/* Checkmark overlay */}
                        {isChecked && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                            <svg className="h-3 w-3 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Submit Button */}
          {selectedShowId && (
            <div className="pt-2">
              {hasSubmittedForSelectedShow ? (
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4 ring-1 ring-green-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Availability Submitted ✓</p>
                    <p className="text-xs text-green-600">
                      Need to make a change?{" "}
                      <a href="mailto:lillian@thesmithagency.net" className="font-medium underline">
                        Contact the office
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={availabilitySaving || selectedDates.length === 0}
                  className={`group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 ${
                    selectedDates.length > 0
                      ? "bg-gradient-to-r from-sa-pink to-[#ff5fa8] shadow-sa-pink/25 hover:shadow-xl hover:shadow-sa-pink/30 hover:scale-[1.02]"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {availabilitySaving ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : selectedDates.length > 0 ? (
                    <>
                      Submit {selectedDates.length} Day{selectedDates.length !== 1 ? "s" : ""}
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Select dates to continue
                    </>
                  )}
                </button>
              )}

              {availabilityError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                  <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {availabilityError}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* My Schedule Section */}
      {availabilityHistory.length > 0 && (() => {
        const today = new Date().toISOString().split("T")[0];
        
        // Separate and sort availability entries
        const enrichedHistory = availabilityHistory.map((entry) => {
          const show = shows.find((s) => s.id === entry.showId) || null;
          const showEndDate = show?.endDate || show?.date || null;
          const isPast = showEndDate && showEndDate < today;
          return { ...entry, show, isPast, sortDate: show?.startDate || show?.date || "9999-99-99" };
        });
        
        const upcomingShows = enrichedHistory
          .filter((e) => !e.isPast)
          .sort((a, b) => a.sortDate.localeCompare(b.sortDate));
        
        const pastShows = enrichedHistory
          .filter((e) => e.isPast)
          .sort((a, b) => b.sortDate.localeCompare(a.sortDate)); // Most recent first for past
        
        const displayList = scheduleView === "upcoming" ? upcomingShows : pastShows;
        
        return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-sa-navy">
              <svg className="h-5 w-5 text-sa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              My Schedule
            </h3>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setScheduleView("upcoming")}
                  className={`rounded-md px-3 py-1.5 transition-all ${
                    scheduleView === "upcoming"
                      ? "bg-white text-sa-navy shadow-sm"
                      : "text-sa-slate hover:text-sa-navy"
                  }`}
                >
                  Upcoming
                  {upcomingShows.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-sa-pinkLight px-1.5 py-0.5 text-[10px] font-semibold text-sa-pink">
                      {upcomingShows.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView("past")}
                  className={`rounded-md px-3 py-1.5 transition-all ${
                    scheduleView === "past"
                      ? "bg-white text-sa-navy shadow-sm"
                      : "text-sa-slate hover:text-sa-navy"
                  }`}
                >
                  Past
                  {pastShows.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {pastShows.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {displayList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
                <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-xs text-sa-slate">
                  {scheduleView === "upcoming" 
                    ? "No upcoming shows. Submit your availability above!"
                    : "No past shows yet."}
                </p>
              </div>
            ) : displayList.map((entry) => {
              const dates = Array.isArray(entry.availableDates)
                ? entry.availableDates
                : Array.isArray(entry.dates)
                ? entry.dates
                : [];
              const show = entry.show;
              const title = show?.name || "Show availability";
              
              // Find bookings for this show and build a map of date -> company
              const showBookings = staffBookings.filter((booking) => booking.showId === entry.showId);
              const dateToCompany = {};
              showBookings.forEach((booking) => {
                if (Array.isArray(booking.assignedDates)) {
                  booking.assignedDates.forEach((d) => {
                    dateToCompany[d] = booking.clientCompanyName || "Client";
                  });
                }
              });
              
              // Count booked days out of available days
              const bookedDates = dates.filter((d) => dateToCompany[d]);
              const bookedCount = bookedDates.length;
              const totalCount = dates.length;
              const hasBookings = bookedCount > 0;

              return (
                <div
                  key={entry.id}
                  className="group rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-4 transition-all hover:shadow-md hover:border-sa-pink/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {hasBookings ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-50">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50">
                          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sa-navy">{title}</p>
                        <p className="text-xs text-sa-slate">
                          {hasBookings ? (
                            <>
                              <span className="font-semibold text-green-600">{bookedCount}/{totalCount}</span>
                              <span className="ml-1">days booked</span>
                            </>
                          ) : (
                            <>
                              {totalCount} day{totalCount !== 1 ? "s" : ""} available
                              <span className="ml-1 text-amber-600">· Pending</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {show?.location && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-sa-slate">
                        {show.location}
                      </span>
                    )}
                  </div>
                  
                  {dates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dates.map((value) => {
                        const company = dateToCompany[value];
                        const isBooked = !!company;
                        return (
                          <div
                            key={value}
                            className={`inline-flex flex-col items-center rounded-lg px-2.5 py-1.5 text-xs ${
                              isBooked
                                ? "bg-green-100 ring-1 ring-green-200"
                                : "bg-sa-pinkLight/50"
                            }`}
                          >
                            <span className={`font-medium ${isBooked ? "text-green-700" : "text-sa-pink"}`}>
                              {formatShortDate(value)}
                            </span>
                            {isBooked && (
                              <span className="mt-0.5 text-[10px] font-medium text-green-600 max-w-[80px] truncate">
                                {company}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
