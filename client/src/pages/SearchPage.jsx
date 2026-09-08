import { useState } from "react";
import { Link } from "react-router-dom";

import searchService from "../services/searchService";

function SearchPage() {
  const [query, setQuery] = useState("");

  const [students, setStudents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [collaborations, setCollaborations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();

    const searchTerm = query.trim();

    if (!searchTerm) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const [
        studentResults,
        postResults,
        collaborationResults,
      ] = await Promise.all([
        searchService.searchStudents(searchTerm),
        searchService.searchPosts(searchTerm),
        searchService.searchCollaborations(
          searchTerm
        ),
      ]);

      setStudents(studentResults);
      setPosts(postResults);
      setCollaborations(
        collaborationResults
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Search CampusConnect
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Discover students, posts, and collaborations.
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search students, posts, collaborations..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* No results */}
      {!loading &&
        searched &&
        students.length === 0 &&
        posts.length === 0 &&
        collaborations.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center transition-colors dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-xl dark:bg-indigo-500/10">
              🔎
            </div>

            <p className="mt-4 text-slate-500 dark:text-slate-400">
              No results found for "{query}".
            </p>
          </div>
        )}

      {/* Students */}
      {students.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">
            Students ({students.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {students.map((student) => (
              <Link
                key={student._id}
                to={`/app/profile/${student._id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >

                <div className="flex items-center gap-3">

                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={student.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                      👤
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                      {student.name}
                    </h3>

                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {student.university}
                    </p>
                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {student.course}
                  </p>

                  {student.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {student.skills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}

                </div>

              </Link>
            ))}

          </div>
        </section>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">
            Posts ({posts.length})
          </h2>

          <div className="space-y-4">

            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/app/posts/${post._id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >

                <div className="flex items-center gap-3">

                  {post.author?.profileImage ? (
                    <img
                      src={post.author.profileImage}
                      alt={post.author.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      👤
                    </div>
                  )}

                  <div className="min-w-0">

                    <h3 className="truncate font-medium text-slate-800 dark:text-white">
                      {post.author?.name}
                    </h3>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(
                        post.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

                <p className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {post.content}
                </p>

              </Link>
            ))}

          </div>
        </section>
      )}

      {/* Collaborations */}
      {collaborations.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">
            Collaborations ({collaborations.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {collaborations.map(
              (collaboration) => (
                <Link
                  key={collaboration._id}
                  to={`/app/collaborations/${collaboration._id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
                >

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {collaboration.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                    {collaboration.description}
                  </p>

                  {collaboration.requiredSkills
                    ?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {collaboration.requiredSkills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                          >
                            {skill}
                          </span>
                        ))}

                    </div>
                  )}

                </Link>
              )
            )}

          </div>
        </section>
      )}

    </div>
  );
}

export default SearchPage;