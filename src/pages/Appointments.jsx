import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("/api/appointments");
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    if (statusFilter === "all") return true;
    return appointment.status === statusFilter;
  });

  const cancelAppointment = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, {
        status: "cancelled",
      });
      setAppointments((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: "cancelled" } : app
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <li key={appointment._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {user.role === "client" ? (
                        <span>
                          With {appointment.counselor.firstName}{" "}
                          {appointment.counselor.lastName}
                        </span>
                      ) : (
                        <span>
                          With {appointment.client.firstName}{" "}
                          {appointment.client.lastName}
                        </span>
                      )}
                    </p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {appointment.time}
                    </div>
                    <span
                      className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.type === "mental-health"
                          ? "bg-purple-100 text-purple-800"
                          : appointment.type === "relationship"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {appointment.type.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {appointment.status === "scheduled" && (
                      <>
                        <Link
                          to={`/video-call/${appointment._id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Join Session
                        </Link>
                        {user.role === "client" && (
                          <button
                            onClick={() => cancelAppointment(appointment._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">No appointments found</p>
          {user.role === "client" && (
            <Link
              to="/counselors"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Find a Counselor
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
