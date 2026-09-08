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
      setError("");

      const data =
        await userService.getStudents(searchValue);

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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Discover Students
        </h1>

        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Find students, collaborators, and potential teammates.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name, university, course, or skills..."
          className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-10 text-center text-slate-500 dark:text-slate-400">
          Finding students...
        </div>
      ) : students.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center transition-colors dark:border-slate-700 dark:bg-slate-900">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-xl dark:bg-indigo-500/10">
            👥
          </div>

          <h3 className="mt-4 font-semibold text-slate-700 dark:text-white">
            No students found
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try searching for something else.
          </p>

        </div>
      ) : (
        /* Student grid */
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >

                {/* Student header */}
                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {initial}
                  </div>

                  <div className="min-w-0">

                    <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                      {student.name}
                    </h3>

                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {student.course}
                    </p>

                  </div>

                </div>

                {/* University */}
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  {student.university}
                </p>

                {/* Bio */}
                {student.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {student.bio}
                  </p>
                )}

                {/* Skills */}
                {student.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {student.skills
                      .slice(0, 4)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
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