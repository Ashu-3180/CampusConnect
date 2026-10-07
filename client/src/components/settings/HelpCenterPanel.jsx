import { useMemo, useState } from "react";

import SettingsModal from "./SettingsModal";
import { SettingsIcon as Icon } from "./SettingsUI";

const FAQ_ITEMS = [
  {
    category: "Account",
    question: "How do I change my password?",
    answer:
      "Open Settings → Password & Security. Enter your current password and a new password of at least 6 characters.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer:
      "Open Settings → Delete Account. Confirm with your password and type DELETE. This permanently removes your account and related data.",
  },
  {
    category: "Profile",
    question: "How do I update my profile photo?",
    answer:
      "Go to Profile, choose a photo (JPG, PNG, WEBP, or GIF up to 5 MB), and upload it. New photos are stored securely via CampusConnect media.",
  },
  {
    category: "Privacy",
    question: "Who can see my profile?",
    answer:
      "Use Profile Visibility in Settings: Everyone, Connections, or Only me. CampusConnect enforces this when someone opens your profile.",
  },
  {
    category: "Connections",
    question: "How do connections work?",
    answer:
      "From Discover or a user profile, send a connection request. The other student can accept or decline. Accepted connections appear in My Network.",
  },
  {
    category: "Messages",
    question: "How do I message someone?",
    answer:
      "Open Messages or start a chat from a connection. Conversations require authentication and appear in your Messages list.",
  },
  {
    category: "Posts",
    question: "What can I include in a post?",
    answer:
      "A post can be text only, one image, one video, or text with one image or one video. Empty posts and image+video together are not supported.",
  },
  {
    category: "Comments",
    question: "Can I delete a comment?",
    answer:
      "Yes. You can delete comments you wrote. You cannot delete someone else's comment.",
  },
  {
    category: "Events",
    question: "How do events work?",
    answer:
      "Browse Events to join campus events, or create one as an organizer. You can leave events you joined (organizers cannot leave their own).",
  },
  {
    category: "Collaborations",
    question: "How do collaborations work?",
    answer:
      "Create or browse collaboration projects, apply to join, and owners can accept applications. Members collaborate on the listed project.",
  },
  {
    category: "Notifications",
    question: "Where do notifications appear?",
    answer:
      "In-app notifications appear in the notification bell. You can tune event and collaboration categories under Settings → Events & Collaborations.",
  },
  {
    category: "Settings",
    question: "Do preferences save automatically?",
    answer:
      "Yes. Dark mode, visibility, language, and notification preferences autosave when you change them. There is no separate Save Preferences button.",
  },
  {
    category: "Clubs",
    question: "How do clubs work?",
    answer:
      "Open Clubs & Communities to browse, search, create, join, or leave clubs. This is a lightweight membership feature without club chat or club posts.",
  },
];

export default function HelpCenterPanel({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return FAQ_ITEMS;
    }

    return FAQ_ITEMS.filter((item) => {
      const haystack =
        `${item.category} ${item.question} ${item.answer}`.toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }

      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered]);

  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      title="Help Center"
      description="Find answers about CampusConnect features."
      icon={<Icon name="info" size={21} />}
      onClose={() => {
        setQuery("");
        setOpenId("");
        onClose();
      }}
    >
      <div className="space-y-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search help topics..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />

        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No matching help topics.
          </p>
        ) : (
          Object.entries(grouped).map(
            ([category, items]) => (
              <section key={category} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  {category}
                </h3>

                {items.map((item) => {
                  const id = `${category}-${item.question}`;
                  const isOpen = openId === id;

                  return (
                    <div
                      key={id}
                      className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenId(isOpen ? "" : id)
                        }
                        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.question}
                        </span>

                        <span className="text-slate-400">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <p className="border-t border-slate-100 px-3.5 py-3 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </section>
            )
          )
        )}
      </div>
    </SettingsModal>
  );
}
