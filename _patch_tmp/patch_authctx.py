from pathlib import Path

root = Path(r"E:/Projects/CampusConnect")
path = root / "client/src/context/AuthContext.jsx"
text = path.read_text(encoding="utf-8")

old_import = """import authService from \"../services/authService\";
import socket from \"../socket/socket\";"""

new_import = """import authService from \"../services/authService\";
import { normalizeImageUrl } from \"../services/api\";
import socket from \"../socket/socket\";

function normalizeAuthUser(user) {
  if (!user || typeof user !== \"object\") {
    return user;
  }

  const normalized = {
    ...user,
    // Login/register historically returned `id` instead of `_id`.
    _id: user._id || user.id,
  };

  if (normalized.profileImage) {
    normalized.profileImage = normalizeImageUrl(
      normalized.profileImage
    );
  }

  return normalized;
}"""

if old_import not in text:
    raise SystemExit("import block not found")
text = text.replace(old_import, new_import, 1)

# Replace setUser(data.user) occurrences with normalize
text = text.replace(
    "setUser(data.user);",
    "setUser(normalizeAuthUser(data.user));",
)

# socket.auth userId should use normalized id
text = text.replace(
    """socket.auth = {
          userId: data.user._id,
        };""",
    """socket.auth = {
          userId: data.user._id || data.user.id,
        };""",
)
text = text.replace(
    """socket.auth = {
      userId: data.user._id,
    };""",
    """socket.auth = {
      userId: data.user._id || data.user.id,
    };""",
)

# updateUser should also normalize
text = text.replace(
    """const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };""",
    """const updateUser = (updatedUser) => {
    setUser(normalizeAuthUser(updatedUser));
  };""",
)

path.write_text(text, encoding="utf-8")
print("AuthContext.jsx updated")
