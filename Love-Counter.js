// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: heart;
const NAMES = ["I", "N"];
const ANNIVERSARY = "2021-05-10";  // "Year-Month-Day"

const FONT_NAME = "Courier-Bold";
const FONT_SIZE = 25;

const COLORS = {
  bg0: "#000080",  // Top
  bg1: "#008080",  // Bottom
  line0: "#E81224",  // Foreground
  line1: "#EF6950",  // Background
  text: "#FFFFFF"
};

const CONTEXT_WIDTH = 125;
const CONTEXT_HEIGHT = 5;

const data = await fetchData();
const widget = createWidget(data);

if (config.runsInApp) {
  console.log("> Running in app <")
  widget.presentSmall();
}

console.log("Done!");
Script.setWidget(widget);
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

  // Add names
  const nameStack = stack.addStack();
  nameStack.addSpacer();
  const nameLine = nameStack.addText(`${NAMES[0]} ❤️ ${NAMES[1]}`);
  nameLine.textColor = new Color(COLORS.text);
  nameLine.font = new Font(FONT_NAME, FONT_SIZE);
  nameStack.addSpacer();
  stack.addSpacer(15);

  // Add progress line
  const progressStack = stack.addStack();
  progressStack.addSpacer();
  const progress = getProgressImage(data.progress);
  progressStack.addImage(progress);
  progressStack.addSpacer();
  stack.addSpacer(15);

  // Add day counter
  const dayStack = stack.addStack();
  dayStack.addSpacer();
  const dayLine = dayStack.addText(`${data.days} days`);
  dayLine.textColor = new Color(COLORS.text);
  dayLine.font = new Font(FONT_NAME, FONT_SIZE);
  dayStack.addSpacer();

  return widget;
}

function getProgressImage(value) {
  const context = new DrawContext();
  context.size = new Size(CONTEXT_WIDTH, CONTEXT_HEIGHT);
  context.respectScreenScale=true;
  context.opaque=false;

  // Background line
  const path = new Path();
  context.setFillColor(new Color(COLORS.line1));
  path.addRoundedRect(new Rect(0, 0, CONTEXT_WIDTH, CONTEXT_HEIGHT), 3, 2);
  context.addPath(path);
  context.fillPath();

  // Foreground line
  const path2 = new Path();
  context.setFillColor(new Color(COLORS.line0));
  path2.addRoundedRect(new Rect(0, 0, CONTEXT_WIDTH / 100 * value, CONTEXT_HEIGHT), 3, 2);
  context.addPath(path2);
  context.fillPath();

  return context.getImage();
}

async function fetchData() {
  const progress = new Date().getHours() * 100 / 24;
  const timeDifference = new Date().getTime() - new Date(ANNIVERSARY);
  const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

  return {progress, days: `${Math.round(dayDifference)}`};
}
