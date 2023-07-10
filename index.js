const fs = require("fs");
const qrcode = require("qrcode-terminal");

const {
  Client,
  MessageMedia,
  Location,
  List,
  Buttons,
  LocalAuth,
} = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Store the menu contexts for each chat ID
const menuContexts = {};

// Define the menus and their corresponding logic
const menus = [
  {
    name: "main",
    options: [
      {
        number: "1",
        label: "Admission Information",
        menu: "admission",
        action: handleMenu,
      },
      {
        number: "2",
        label: "Academic Calendar",
        menu: "calendar",
        action: handleMenu,
      },
      {
        number: "3",
        label: "Exam Date Sheet",
        menu: "datesheet",
        action: handleMenu,
      },
      { number: "4", label: "Syllabus", menu: "syllabus", action: handleMenu },
      {
        number: "5",
        label: "Help Desk",
        menu: "Help",
        action: handleMenu,
      },
    ],
  },

  //-----admission deatils

  {
    name: "admission",
    options: [
      {
        number: "1",
        label: "ADMISSION NOTICE M.A. IN YOGA AND B.P.ED",
        data: "B.P.ED",
        data_file: "data-admission",
        action: handleAction,
      },
      {
        number: "2",
        label:
          "Admission - B.A. Mass Communication Department Session (2023-26)",
        data: "B.A. Mass Communication",
        data_file: "data-admission",
        action: handleAction,
      },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },

  //---- Academic Calender

  {
    name: "calendar",
    options: [
      {
        number: "1",
        label: "calendar-2022",
        data: "calendar-2022",
        data_file: "data-calendar",
        action: handleAction,
      },
      {
        number: "2",
        label: "calendar-2023",
        data: "calendar-2023",
        data_file: "data-calendar",
        action: handleAction,
      },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },

  //----Exams Datesheets

  {
    name: "datesheet",
    options: [
      {
        number: "1",
        label: "UG SEMESTER IV TIME TALBLE 2023",
        data: "UG-SEMESTER-4",
        data_file: "data-datesheet",
        action: handleAction,
      },
      {
        number: "2",
        label: "UG SEMESTER VI TIME TABLE 2023",
        data: "UG-SEMESTER-6",
        data_file: "data-datesheet",
        action: handleAction,
      },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },

  //---Syllabus

  {
    name: "syllabus",
    options: [
      { number: "1", label: "BSC", menu: "bsc-syllabus", action: handleMenu },
      { number: "2", label: "MSC", menu: "msc-syllabus", action: handleMenu },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },
  {
    name: "bsc-syllabus",
    options: [
      {
        number: "1",
        label: "Semester 1",
        data: "bsc-sem1",
        data_file: "data-syllabus",
        action: handleAction,
      },
      {
        number: "2",
        label: "Semester 2",
        data: "bsc-sem2",
        data_file: "data-syllabus",
        action: handleAction,
      },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },
  {
    name: "msc-syllabus",
    options: [
      {
        number: "1",
        label: "Semester 1",
        data: "msc-sem1",
        data_file: "data-syllabus",
        action: handleAction,
      },
      {
        number: "2",
        label: "Semester 2",
        data: "msc-sem1",
        data_file: "data-syllabus",
        action: handleAction,
      },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },

  //-----HelpDesk

  {
    name: "help",
    options: [
      { number: "1", label: "657-2249105", menu: "", action: handleMenu },
      {
        number: "2",
        label: "admissions@jwu.ac.in",
        menu: "",
        action: handleMenu,
      },
      { number: "3", label: "Back", menu: "back", action: handleMenu },
    ],
  },
];

// Function to display a menu
function displayMenu(menu) {
  console.log(menu);
  const options = menu.options
    .map((option) => `${option.number}. ${option.label}`)
    .join("\n");
  return `${menu.name} Menu:\n${options}\n\nReply with the number of your choice.`;
}

// Handle incoming messages
client.on("message", async (msg) => {
  const chatId = msg.from;
  const chat = await msg.getChat();
  const message = msg.body.toLowerCase().trim();

  let menuContext = menuContexts[chatId] || "main";

  if (message === "hi") {
    // Send the main menu to the user
    menuContexts[chatId] = "main";
    menuContext = "main";
    chat.sendMessage(displayMenu(getMenu(menuContext)));
  } else {
    console.log(menuContexts[chatId], menuContext, message);
    // Process user input based on the current menu context
    const menu = getMenu(menuContext);
    const option = menu.options.find((opt) => opt.number === message);
    if (option) {
      option.action(chat, chatId, option);
    } else {
      //console.log("Invalid input.");
      //chat.sendMessage('Invalid input. Please try again.');
    }
  }
});

// Function to get a menu by name
function getMenu(name) {
  return menus.find((menu) => menu.name === name);
}

// Menu option logic functions
function handleMenu(chat, chatId, option) {
  let menuName = option.menu.toLowerCase();

  menuContexts[chatId] = menuName;
  if (menuName === "back") {
    menuContexts[chatId] = "main";
    menuName = "main";
  }

  chat.sendMessage(displayMenu(getMenu(menuName)));
}

function handleCardMenu(chat, chatId, option) {
  let menuName = option.menu.toLowerCase();
  menuContexts[chatId] = "card";
  chat.sendMessage(displayMenu(getMenu("card")));
}

//get data from file and return
function handleAction(chat, chatId, option) {
  let dataKey = option.data;

  let fileName = option.data_file + ".json";
  //read file
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    // Parse the JSON data
    let jsonData = JSON.parse(data);
    let result = searchByKey(dataKey, jsonData);
    //console.log();
    if (result) {
      if (result.type == "file") {
        const media = MessageMedia.fromFilePath(result.val);
        chat.sendMessage(media);
      }
      if (result.type == "text") chat.sendMessage(`Data: ${result.val}`);
    } else {
      chat.sendMessage("Data not found.");
    }
  });
}

function searchByKey(key, data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key.includes(key)) {
      const valueArray = data[i].value;
      const valueType = data[i].type;
      const randomIndex = Math.floor(Math.random() * valueArray.length);
      return { type: valueType, val: valueArray[randomIndex] };
    }
  }
  return null;
}

// Initialize the client
client.initialize();
