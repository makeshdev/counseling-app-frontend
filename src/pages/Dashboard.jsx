import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.firstName}</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        {appointments.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
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
                      <p className="text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at{" "}
                        {appointment.time}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                    <div>
                      <Link
                        to={`/video-call/${appointment._id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Join Session
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <p className="text-gray-500">No upcoming appointments</p>
            <Link
              to="/counselors"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Find a Counselor
            </Link>
          </div>
        )}
      </div>

      {user.role === "counselor" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/appointments"
              className="bg-white shadow rounded-lg p-6 hover:bg-gray-50"
            >
              <h3 className="font-medium text-lg mb-2">
                View All Appointments
              </h3>
              <p className="text-gray-600">
                Manage your schedule and upcoming sessions
              </p>
            </Link>
            <Link
              to="/profile"
              className="bg-white shadow rounded-lg p-6 hover:bg-gray-50"
            >
              <h3 className="font-medium text-lg mb-2">Update Profile</h3>
              <p className="text-gray-600">
                Edit your availability and specialization
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
