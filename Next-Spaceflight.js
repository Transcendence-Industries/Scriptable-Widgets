// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: rocket;
const API_URL = "https://fdo.rocketlaunch.live/json/launches/next/5";
const API_PROVIDER = ["SpaceX"]  // List of provider: https://www.rocketlaunch.live/api

const FONT_NAME = "Menlo-Bold";
const FONT_SIZE = 20;

const COLORS = {
  bg0: "#800080",  // Top
  bg1: "#000080",  // Bottom
  text: "#FFFFFF"
};

const SAVE_FILE = "space-flights.json";

if (config.runsInApp) {
  const data = await requestLaunches();
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
  console.log("Creating Widget...");

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
    // Add launches
    let text = "";
    data.forEach((element, index) => {
      text += `🚀 ${element.missions[0].name} - (${element.date_str})`;
      if (index < data.length - 1) {
        text += "\n";
      }
    });

    const launchLine = stack.addText(text);
    launchLine.textColor = new Color(COLORS.text);
    launchLine.font = new Font(FONT_NAME, FONT_SIZE);
    launchLine.minimumScaleFactor = 0.5;
  } else {
    // Add info
    const infoLine = stack.addText("Connection error! 😿");
    infoLine.textColor = new Color(COLORS.text);
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
    data = await requestLaunches();
    
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

async function requestLaunches() {
  console.log("Requesting launches...");

  // Fetch launches
  let dataAll;
  try {
    const request = new Request(API_URL);
    dataAll = await request.loadJSON();
  } catch (error) {
    console.log("Connection error!")
    dataAll = null;
    return dataAll;
  }

  // Filter launches
  let dataFiltered = [];
  dataAll.result.forEach(element => {
    if (API_PROVIDER.some(item => item == element.provider.name)) {
      dataFiltered.push(element);
    }
  });

  return dataFiltered;
}
