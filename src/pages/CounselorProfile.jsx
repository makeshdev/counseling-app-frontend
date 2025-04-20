import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function CounselorProfile() {
  const { id } = useParams();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("mental-health");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounselor = async () => {
      try {
        const res = await axios.get(
          `https://counseling-app-backend.onrender.com/api/users/counselors/${id}`
        );

        // For demo purposes: Ensure slots exist
        let counselorData = res.data;
        if (counselorData.availableSlots.length === 0) {
          // In production, you would redirect or show a message
          console.warn("No slots available - showing demo slots");
          counselorData = {
            ...counselorData,
            availableSlots: generateDemoSlots(),
          };
        }

        setCounselor(counselorData);
      } catch (err) {
        console.error(err);
        setError("Failed to load counselor data");
      } finally {
        setLoading(false);
      }
    };

    fetchCounselor();
  }, [id]);

  useEffect(() => {
    if (selectedDate && counselor?.availableSlots) {
      const slotsForDate = counselor.availableSlots
        .filter((slot) => slot.startsWith(selectedDate))
        .map((slot) => slot.split("T")[1].substring(0, 5));

      setAvailableSlots(slotsForDate);
      setSelectedTime("");
    } else {
      setAvailableSlots([]);
      setSelectedTime("");
    }
  }, [selectedDate, counselor]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !sessionType) {
      setError("Please select date, time and session type");
      return;
    }

    try {
      const res = await axios.post(
        "https://counseling-app-backend.onrender.com/api/appointments",
        {
          counselor: id,
          date: selectedDate,
          time: selectedTime,
          type: sessionType,
        }
      );
      window.location.href = `/payments?appointment=${res.data._id}`;
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to book appointment");
      console.error(err);
    }
  };

  // Demo slot generator (for frontend fallback)
  function generateDemoSlots() {
    const slots = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      slots.push(`${dateStr}T10:00:00`, `${dateStr}T14:00:00`);
    }
    return slots;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!counselor) {
    return <div className="text-center py-12">Counselor not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Counselor profile header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
            {counselor.firstName.charAt(0)}
            {counselor.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {counselor.firstName} {counselor.lastName}
            </h1>
            <p className="text-gray-600 capitalize">
              {counselor.specialization?.replace("-", " ") || "Counselor"}
            </p>
            {counselor.bio && (
              <p className="mt-2 text-gray-700">{counselor.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Book a Session</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>
            <select
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="mental-health">Mental Health</option>
              <option value="relationship">Relationship</option>
              <option value="career">Career</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || availableSlots.length === 0}
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            {selectedDate && availableSlots.length === 0 && (
              <p className="mt-1 text-sm text-red-600">
                No available slots for this date
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
