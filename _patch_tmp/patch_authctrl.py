from pathlib import Path

root = Path(r"E:/Projects/CampusConnect")
path = root / "server/src/controllers/authController.js"
text = path.read_text(encoding="utf-8")

# Add import for normalize
old = """const generateToken = require(\"../utils/generateToken\");

const path = require(\"path\");
const fs = require(\"fs\");"""

new = """const generateToken = require(\"../utils/generateToken\");
const {
  normalizeProfileImageUrl,
} = require(\"../utils/profileImageUrl\");

const path = require(\"path\");
const fs = require(\"fs\");

const toSafeUser = (user, req) => {
  const plain =
    typeof user.toObject === \"function\"
      ? user.toObject()
      : { ...user };

  delete plain.password;

  if (plain.profileImage) {
    plain.profileImage = normalizeProfileImageUrl(
      plain.profileImage,
      req
    );
  }

  return plain;
};"""

if old not in text:
    raise SystemExit("auth import block not found")
text = text.replace(old, new, 1)

# Fix register response
old_reg = """    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: \"User registered successfully\",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        course: user.course,
        graduationYear: user.graduationYear,
      },
    });"""

new_reg = """    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: \"User registered successfully\",
      token,
      user: toSafeUser(user, req),
    });"""

if old_reg not in text:
    raise SystemExit("register response not found")
text = text.replace(old_reg, new_reg, 1)

# Fix login response
old_login = """    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: \"Login successful\",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        course: user.course,
        graduationYear: user.graduationYear,
      },
    });"""

new_login = """    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: \"Login successful\",
      token,
      user: toSafeUser(user, req),
    });"""

if old_login not in text:
    raise SystemExit("login response not found")
text = text.replace(old_login, new_login, 1)

# Fix getCurrentUser response
old_me = """    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {"""

new_me = """    res.status(200).json({
      success: true,
      user: toSafeUser(user, req),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {"""

if old_me not in text:
    raise SystemExit("getCurrentUser response not found")
text = text.replace(old_me, new_me, 1)

path.write_text(text, encoding="utf-8")
print("authController.js updated")
