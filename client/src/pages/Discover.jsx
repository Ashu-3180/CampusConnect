import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import userService from "../services/userService";

function Discover() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = async (searchValue = "") => {
    try {
      setLoading(true);

      const data =
        await userService.getStudents(
          searchValue
        );

      setStudents(data.students);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Discover Students
        </h1>

        <p className="mt-1 text-slate-500">
          Find students, collaborators, and potential teammates.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search by name, university, course, or skills..."
        className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">
          Finding students...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

          <h3 className="font-semibold text-slate-700">
            No students found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try searching for something else.
          </p>

        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {students.map((student) => {

            const initial = student.name
              ? student.name
                  .charAt(0)
                  .toUpperCase()
              : "U";

            return (
              <Link
                key={student._id}
                to={`/app/profile/${student._id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                    {initial}
                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      {student.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {student.course}
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {student.university}
                </p>

                {student.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {student.bio}
                  </p>
                )}

                {student.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {student.skills
                      .slice(0, 4)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600"
                        >
                          {skill}
                        </span>
                      ))}

                  </div>
                )}

              </Link>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Discover;