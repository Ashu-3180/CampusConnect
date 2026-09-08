import { Link } from "react-router-dom";

function CollaborationCard({
  collaboration,
}) {
  const spotsLeft =
    collaboration.maxMembers -
    collaboration.members.length;

  return (
    <Link
      to={`/app/collaborations/${collaboration._id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {collaboration.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Created by{" "}
            {collaboration.owner?.name}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            collaboration.status === "open"
              ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {collaboration.status}
        </span>

      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {collaboration.description}
      </p>

      {collaboration.requiredSkills?.length >
        0 && (
        <div className="mt-4 flex flex-wrap gap-2">

          {collaboration.requiredSkills.map(
            (skill) => (
              <span
                key={skill}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
              >
                {skill}
              </span>
            )
          )}

        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">

        <span className="text-slate-500 dark:text-slate-400">
          👥 {collaboration.members.length}/
          {collaboration.maxMembers} members
        </span>

        {collaboration.status === "open" && (
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {spotsLeft} spot
            {spotsLeft !== 1 ? "s" : ""} left
          </span>
        )}

      </div>

    </Link>
  );
}

export default CollaborationCard;