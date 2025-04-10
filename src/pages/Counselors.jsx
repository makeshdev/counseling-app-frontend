import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Counselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        let url = "/api/users/counselors";
        if (specialization) {
          url += `?specialization=${specialization}`;
        }
        const res = await axios.get(url);
        setCounselors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, [specialization]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Find a Counselor</h1>

      <div className="mb-6">
        <label
          htmlFor="specialization"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filter by Specialization
        </label>
        <select
          id="specialization"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="">All Specializations</option>
          <option value="mental-health">Mental Health</option>
          <option value="relationship">Relationship</option>
          <option value="career">Career</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : counselors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {counselors.map((counselor) => (
            <div
              key={counselor._id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {counselor.firstName.charAt(0)}
                    {counselor.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {counselor.firstName} {counselor.lastName}
                    </h3>
                    <p className="text-gray-600">
                      {counselor.specialization.replace("-", " ")}
                    </p>
                  </div>
                </div>
                {counselor.bio && (
                  <p className="mt-4 text-gray-600 line-clamp-3">
                    {counselor.bio}
                  </p>
                )}
                <div className="mt-6">
                  <Link
                    to={`/counselors/${counselor._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">No counselors found</p>
        </div>
      )}
    </div>
  );
}
