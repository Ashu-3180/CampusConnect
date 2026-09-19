from pathlib import Path

root = Path(r"E:/Projects/CampusConnect")
path = root / "server/src/controllers/userController.js"
text = path.read_text(encoding="utf-8")

old_imports = """const path = require(\"path\");
const fs = require(\"fs\");
const sharp = require(\"sharp\");

const User = require(\"../models/User\");
const Post = require(\"../models/Post\");
const createNotification = require(\"../utils/createNotification\");"""

new_imports = """const path = require(\"path\");
const fs = require(\"fs\");
const sharp = require(\"sharp\");

const User = require(\"../models/User\");
const Post = require(\"../models/Post\");
const createNotification = require(\"../utils/createNotification\");
const {
  buildProfileImageUrl,
  normalizeProfileImageUrl,
} = require(\"../utils/profileImageUrl\");

const withNormalizedProfileImage = (user, req) => {
  if (!user) {
    return user;
  }

  const plain =
    typeof user.toObject === \"function\"
      ? user.toObject()
      : { ...user };

  if (plain.profileImage) {
    plain.profileImage = normalizeProfileImageUrl(
      plain.profileImage,
      req
    );
  }

  return plain;
};"""

if old_imports not in text:
    raise SystemExit("userController imports not found")
text = text.replace(old_imports, new_imports, 1)

# getMyProfile response
text = text.replace(
"""    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (""",
"""    res.status(200).json({
      success: true,
      user: withNormalizedProfileImage(user, req),
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (""",
1)

# updateMyProfile response
text = text.replace(
"""    res.status(200).json({
      success: true,
      message: \"Profile updated successfully\",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getMyPreferences = async (""",
"""    res.status(200).json({
      success: true,
      message: \"Profile updated successfully\",
      user: withNormalizedProfileImage(user, req),
    });
  } catch (error) {
    next(error);
  }
};

const getMyPreferences = async (""",
1)

# upload image URL generation
old_url = """    const imageUrl = `${req.protocol}://${req.get(
      \"host\"
    )}/uploads/profile-images/${fileName}`;"""

new_url = """    const imageUrl = buildProfileImageUrl(req, fileName);"""

if old_url not in text:
    raise SystemExit("imageUrl builder not found")
text = text.replace(old_url, new_url, 1)

# upload response
text = text.replace(
"""    res.status(200).json({
      success: true,
      message: \"Profile image uploaded successfully\",
      user,
    });""",
"""    res.status(200).json({
      success: true,
      message: \"Profile image uploaded successfully\",
      user: withNormalizedProfileImage(user, req),
    });""",
1)

# getUserProfile - find the response. Read around getUserProfile
if "user: withNormalizedProfileImage(user, req)" not in text.split("getUserProfile")[-1][:800]:
    # try replace the getUserProfile success response uniquely
    marker = "const getUserProfile"
    idx = text.find(marker)
    if idx < 0:
        raise SystemExit("getUserProfile not found")
    # find first res.status(200).json({ success: true, user, }) after getUserProfile that isn't already normalized
    pass

# Normalize getUserProfile response if present as raw user
old_profile = None
# Look for pattern in getUserProfile section
section_start = text.find("const getUserProfile")
section_end = text.find("const uploadProfileImage")
section = text[section_start:section_end]
if "withNormalizedProfileImage(user, req)" not in section:
    if """res.status(200).json({
      success: true,
      user,
    });""" in section:
        new_section = section.replace(
"""    res.status(200).json({
      success: true,
      user,
    });""",
"""    res.status(200).json({
      success: true,
      user: withNormalizedProfileImage(user, req),
    });""",
1)
        text = text[:section_start] + new_section + text[section_end:]
        print("getUserProfile normalized")
    else:
        print("WARNING: getUserProfile response pattern not found")
else:
    print("getUserProfile already normalized")

path.write_text(text, encoding="utf-8")
print("userController.js updated")
