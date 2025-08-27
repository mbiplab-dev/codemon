import fs from "fs";

export const getFile = (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).send("No file path provided");

  try {
    let content = fs.readFileSync(filePath.toString(), "utf-8");
    if (content === ""){
      content = '//no file contents'
    }
    res.json({ path: filePath, content });
  } catch (err) {
    res.status(500).json({ error: "Failed to read file", details: err.message });
  }
};

export const saveFile = (req, res) => {
  const { path: filePath, content } = req.body;

  if (!filePath || typeof content !== "string") {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    fs.writeFileSync(filePath, content, "utf-8");
    res.json({ message: "File saved successfully", path: filePath });
  } catch (err) {
    res.status(500).json({ message: "Failed to save file", error: err.message });
  }
};
