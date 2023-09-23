// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: book-open;
const API_URL = "https://api.quotable.io/random";
const API_TAGS = [];  // List of tags: https://api.quotable.io/tags

const FONT_NAME = "AmericanTypewriter";
const FONT_SIZE = 20;

const COLORS = {
  bg0: "#333333",  // Top
  bg1: "#4D4D44D",  // Bottom
  text0: "#FFFFFF",  // Content
  text1: "#FFFFFF"  // Author
};

const SAVE_FILE = "daily-quote.json";

if (config.runsInApp) {
  const data = await requestQuote();
  const widget = createWidget(data);
  console.log("> Running in app <")
  widget.presentMedium();
} else {
  const data = await fetchData();
  const widget = createWidget(data);
  Script.setWidget(widget);
}

console.log("Done!");
Script.complete();

function createWidget(data) {
  console.log("Creating widget...");

  // Base widget
  const widget = new ListWidget();
  const bgColor = new LinearGradient();
  bgColor.colors = [new Color(COLORS.bg0), new Color(COLORS.bg1)];
  bgColor.locations = [0.0, 1.0];
  widget.backgroundGradient = bgColor;
  widget.setPadding(10, 15, 15, 10);

  // Main stack
  const stack = widget.addStack();
  stack.layoutVertically();
  stack.spacing = 1;
  stack.size = new Size(0, 0);

  if (data != null) {
    // Add content
    const contentLine = stack.addText(data.content);
    contentLine.textColor = new Color(COLORS.text0);
    contentLine.font = new Font(FONT_NAME, FONT_SIZE);
    stack.addSpacer(10);

    // Add author
    const authorLine = stack.addText(`~ ${data.author}`);
    authorLine.textColor = new Color(COLORS.text1);
    authorLine.font = new Font(FONT_NAME, FONT_SIZE);
  } else {
    // Add info
    const infoLine = stack.addText("Connection error! 😿");
    infoLine.textColor = new Color(COLORS.text0);
    infoLine.font = new Font(FONT_NAME, FONT_SIZE);
  }

  return widget;
}

async function fetchData() {
  console.log("Loading file...")
  let data = null;

  const manager = FileManager.iCloud();
  const baseDir = manager.documentsDirectory();
  const file = manager.joinPath(baseDir, SAVE_FILE);

  const updatedDate = manager.modificationDate(file);
  const currentDate =  new Date();
  const dayValue = 24 * 60 * 60 * 1000;

  // Check if file needs to be rewritten
  if (!manager.fileExists(file) || currentDate - updatedDate >= dayValue) {
    data = await requestQuote();
    
    if (data != null) {
      await manager.writeString(file, JSON.stringify(data));
    }
  } else {
    // Check if existent file needs to be downloaded
    if (!manager.isFileDownloaded(file)) {
      await manager.downloadFileFromiCloud(file);
    }

    data = await JSON.parse(manager.readString(file));
  }

  return data;
}

async function requestQuote() {
  console.log("Requesting quote...");

  // Add tags to URL
  let url = API_URL + "?tags=";
  API_TAGS.forEach((element, index) => {
    url += element;
    if (index < API_TAGS.length - 1) {
      url += ";";
    }
  });

  // Fetch quote
  let data;
  try {
    const request = new Request(url);
    data = await request.loadJSON();
  } catch (error) {
    console.log("Connection error!")
    data = null;
  }

  return data;
}
