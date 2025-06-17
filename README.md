# Danny's Server

Local control panel for macOS inspired by XAMPP, designed for developers who prefer a fast, straightforward, and elegant interface to manage services like **Apache** and **MySQL**, plus access to tools like **localhost**, **phpMyAdmin**, and other utilities.

## 🧰 Features

- Start, stop, and restart local Apache and MySQL services.
- Quick access to:
  - `localhost` (opens in Brave).
  - `phpMyAdmin` (opens in Brave).
  - **Notion** app.
  - Delete the `httpd.pid` file.
- Real-time monitoring of service status.
- Minimalist interface optimized for macOS (`vibrancy`, `hiddenInset`, no annoying buttons).
- Prevention mechanism to avoid closing with `⌘ + Q` or `⌘ + W` if services are active.
- Built with **Electron** + ❤️.

## 🚀 Installation

> ⚠️ This app doesn't require an installer. It is not packaged as a `.dmg`.

1. Clone or download this repository.
2. Install dependencies:

```bash
npm install
```

3. Run the app in development mode:

```bash
npm start
```

4. To build the app (production mode):

```bash
npm run build
```

> The output will be in `dist/mac/Danny's Server.app`.

## 🛠 Requirements

- macOS 12+
- Node.js 18+
- Brave Browser installed (`/Applications/Brave Browser.app`)
- Notion installed as an `.app` in `/Applications/Notion.app`
- Apache and MySQL managed via Homebrew

## 📂 Project Structure

```
📦 dannys-server
├── css/               # App styles
├── html/              # Main HTML interface
├── img/               # Icons and assets
├── js/
│   ├── main.js        # Main Electron logic
│   ├── menu.js        # App menu
│   ├── backend.js     # System functions
│   ├── preload.js     # Secure channel between renderer and main
│   └── script.js      # App scripts
├── package.json       # Project configuration
└── README.md
```

## 🧑‍💻 Author

Lovingly developed by **Daniel BS** for personal use (shoutout to Miguelito 👊).

---

> MIT License – Do whatever you want with this project! (just don’t sell it on the App Store 😉)
