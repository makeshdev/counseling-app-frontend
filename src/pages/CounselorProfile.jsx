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
        setCounselor(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselor();
  }, [id]);

  useEffect(() => {
    if (selectedDate && counselor?.availableSlots) {
      // Filter slots for the selected date and format them
      const slotsForDate = counselor.availableSlots
        .filter((slot) => {
          const slotDate = slot.split("T")[0];
          return slotDate === selectedDate;
        })
        .map((slot) => {
          const timePart = slot.split("T")[1];
          return timePart.substring(0, 5); // Extract HH:MM format
        });

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
      // Redirect to payment page or show success message
      window.location.href = `/payments?appointment=${res.data._id}`;
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to book appointment");
      console.error(err);
    }
  };

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
      {/* ... (keep the existing profile display code) ... */}

      <div className="border-t border-gray-200 px-6 py-8">
        <h2 className="text-xl font-semibold mb-6">Book a Session</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label
              htmlFor="session-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Session Type
            </label>
            <select
              id="session-type"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="mental-health">Mental Health</option>
              <option value="relationship">Relationship</option>
              <option value="career">Career</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="time"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
