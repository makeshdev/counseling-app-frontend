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
    if (selectedDate && counselor) {
      // Filter available slots for selected date
      const slots = counselor.availableSlots
        .filter((slot) => slot.startsWith(selectedDate))
        .map((slot) => slot.split("T")[1]);
      setAvailableSlots(slots);
      setSelectedTime("");
    }
  }, [selectedDate, counselor]);

  // useEffect(() => {
  //   if (selectedDate && counselor) {
  //     const selected = new Date(selectedDate).toDateString();

  //     const slots = counselor.availableSlots
  //       .filter((slot) => new Date(slot).toDateString() === selected)
  //       .map((slot) => slot.split("T")[1].slice(0, 5)); // HH:MM format

  //     setAvailableSlots(slots);
  //     setSelectedTime("");
  //   }
  // }, [selectedDate, counselor]);

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
      window.location.href = `payments?appointment=${res.data._id}`;
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 sm:flex sm:items-start">
          <div className="flex-shrink-0 mb-6 sm:mb-0 sm:mr-6">
            <div className="h-32 w-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600">
              {counselor.firstName.charAt(0)}
              {counselor.lastName.charAt(0)}
            </div>
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">
              {counselor.firstName} {counselor.lastName}
            </h1>
            <p className="text-lg text-gray-600 capitalize">
              {counselor.specialization.replace("-", " ")} Counselor
            </p>
            {counselor.bio && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="mt-1 text-gray-700">{counselor.bio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-8">
          <h2 className="text-xl font-semibold mb-6">Book a Session</h2>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
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
                  disabled={!selectedDate}
                >
                  <option value="">Select a time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
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
    </div>
  );
}
