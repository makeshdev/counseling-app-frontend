import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DocumentTextIcon, PaperClipIcon } from "@heroicons/react/24/outline";

export default function SessionNotes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, appointmentRes] = await Promise.all([
          axios.get(`/api/session-notes/appointment/${id}`),
          axios.get(`/api/appointments/${id}`),
        ]);
        setNotes(notesRes.data);
        setAppointment(appointmentRes.data);
      } catch (err) {
        console.error(err);
        navigate("/appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setError("Note cannot be empty");
      return;
    }

    try {
      const res = await axios.post("/api/session-notes", {
        appointment: id,
        notes: newNote,
      });
      setNotes([res.data, ...notes]);
      setNewNote("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add note");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/appointments")}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Appointments
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Session Notes</h1>
      <p className="text-gray-600 mb-6">
        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}{" "}
        - {appointment.type.replace("-", " ")}
      </p>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Add New Note</h2>
        </div>
        <div className="px-6 py-4">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows="4"
            placeholder="Write your notes here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="mt-4">
            <button
              onClick={handleAddNote}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Previous Notes</h2>
        </div>
        {notes.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notes.map((note) => (
              <li key={note._id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                      {note.notes}
                    </p>
                    {note.attachments?.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-500">
                          Attachments:
                        </h4>
                        <ul className="mt-1 space-y-1">
                          {note.attachments.map((attachment, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-blue-600 hover:text-blue-500"
                            >
                              <a
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center"
                              >
                                <PaperClipIcon className="h-4 w-4 mr-1" />
                                Attachment {idx + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No notes found for this session</p>
          </div>
        )}
      </div>
    </div>
  );
}
