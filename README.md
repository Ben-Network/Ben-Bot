# **Ben Bot**

![License](https://img.shields.io/badge/License-GPLv3-blue)  
![Discord.js](https://img.shields.io/badge/Discord.js-v14.18.0-blue)  
![MySQL](https://img.shields.io/badge/MySQL-Required-red)  
![Contributions](https://img.shields.io/badge/Contributions-Encouraged-brightgreen)  
[![DeepScan grade](https://deepscan.io/api/teams/26659/projects/29278/branches/940742/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=26659&pid=29278&bid=940742)

Ben Bot is a fun and versatile Discord bot developed by **Ben Network**. What started as an inside joke in 2024 has grown into a fully open-source project. Ben Bot is packed with features like keyword activations, MySQL integration, and a caching system, making it perfect for developers and server admins who want to add some flair to their Discord servers.

---

## **Table of Contents**
1. [Features](#features)
2. [Cloud Hosted](#cloud-hosted)
2. [Security and Privacy](#security-and-privacy)
3. [How to Set Up Ben Bot (Self Hosted)](#how-to-set-up-ben-bot)
4. [Quick Start Guide](#quick-start-guide)
5. [FAQs](#faqs)
6. [Troubleshooting Tips](#troubleshooting-tips)
7. [How to Use Ben Bot](#how-to-use-ben-bot)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

---

## **Features**

- **Keyword Activations**: Responds to specific keywords with text, local files, or web files. (local files are a WIP)
- **Slash Commands**: Includes commands for both users and admins to manage bot behavior.
- **MySQL Integration**: Stores and manages keyword activations in a database.
- **Cache Management**: Reduces database queries with an optimized caching system.
- **Security-Focused**: No personal user data is stored, ensuring privacy.
- **Cloud-Hosted**: You can invite our official hosted version and join the fun!
- **Self-Hosting**: Fully open-source and easy to host on your own.

---

## **Cloud Hosted**
Ben can be pretty hard to install due to the MySQL requirement, and lack of support for other database systems, so we host our own official version

## **Security and Privacy**

Ben Bot is designed with your privacy in mind:
- **No Personal Data**: The bot doesn’t store personal user data, except for storing ignored userIDs (so ben won't scan their messages).
- **Secure Database**: All data is stored securely in a MySQL database.
- **Open Source**: The code is transparent and open for review.

---

## **How to Set Up Ben Bot**

### **Prerequisites**
1. **Node.js**: Install Node.js (v16 or higher).
2. **MySQL**: Set up a MySQL database.
3. **Discord Bot**: Create a bot on the [Discord Developer Portal](https://discord.com/developers/applications).

### **Step-by-Step Setup**
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ben-Network/ben-bot.git
   cd ben-bot
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure the `.env` File**:
   - Rename `.env.example` to `.env`.
   - Fill in the required fields:
     ```properties
      BENBOT_HOST="IP or Address"
      BENBOT_USER="MYSQL Username"
      BENBOT_PASSWORD="MYSQL User Password"
      BENBOT_DATABASE="MYSQL Database Name"
      BENBOT_TABLE="MYSQL Table Name"

      BOTTOKEN="Discord Bot Token"
      BOTID="Discord Bot ID"
      OWNERID="Discord Bot Owner ID"

      BOT_MODE="production" # Options: production, debug, interactive
      LOG_TO_CONSOLE="true"
      LOG_TO_FILE="false"
      HALT_ON_ERROR="false"
      REPLAY_LOG_FILE="/resources/cache/replay.log"
     ```

4. **Set Up the MySQL Database**:
   - Create a database and table for storing keywords. Use this SQL as a reference:
     ```sql
     CREATE DATABASE BenDB;
     USE BenDB;
     CREATE TABLE keywords (
         id INT AUTO_INCREMENT PRIMARY KEY,
         word VARCHAR(255) NOT NULL,
         action JSON NOT NULL,
         authorID VARCHAR(255),
         notes TEXT,
         activations INT DEFAULT 0
     );
     ```

5. **Start the Bot**:
   ```bash
   npm start
   ```

---

## **Quick Start Guide**

Follow these steps to get Ben Bot running quickly:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ben-Network/ben-bot.git
   cd ben-bot
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure the `.env` File**:
   - Rename `.env.example` to `.env`.
   - Fill in the required fields (see [Environment Variables](#environment-variables)).

4. **Set Up MySQL**:
   - Create a database and table using the provided SQL script in the [Setup Section](#how-to-set-up-ben-bot).

5. **Start the Bot**:
   ```bash
   npm start
   ```

---

## **FAQs**

### **1. What happens if the bot doesn’t respond to a keyword?**
Ensure the keyword exists in the database and is properly formatted. Use the `/read` command to verify.

### **2. How do I debug database connection issues?**
- Check your `.env` file for correct MySQL credentials.
- Ensure the MySQL server is running and accessible.

### **3. Can I use a database other than MySQL?**
Currently, Ben Bot only supports MySQL.

### **4. How do I reset the bot’s cache?**
Use the `/dropcache` command to clear and refresh the cache.

---

## **Troubleshooting Tips**

### **Common Issues and Solutions**

| **Issue**                          | **Solution**                                                                  |
|------------------------------------|-------------------------------------------------------------------------------|
| Bot doesn’t respond to commands    | Ensure the bot has the correct permissions in your Discord server.            |
| Database connection error          | Verify MySQL credentials and ensure the database is running.                  |
| Invalid JSON in database           | Use a JSON validator to check and fix the `action` field in the database.     |
| Cache not updating                 | Use the `/dropcache` command to refresh the cache.                            |

### **Debugging**
- Run the bot in `debug` mode by setting `BOT_MODE="debug"` in the `.env` file.
- Check the logs for detailed error messages.

---

## **Environment Variables**

| **Variable**       | **Description**                                                                 |
|--------------------|---------------------------------------------------------------------------------|
| `BENBOT_HOST`             | MySQL server host (e.g., `localhost` or an IP address).                  |
| `BENBOT_USER`             | MySQL username.                                                          |
| `BENBOT_PASSWORD`         | MySQL password.                                                          |
| `BENBOT_DATABASE`         | MySQL database name.                                                     |
| `BENBOT_TABLE`            | MySQL table name for storing keywords.                                   |
| `BOTTOKEN`         | Discord bot token from the Developer Portal.                                    |
| `BOTID`            | Discord bot ID.                                                                 |
| `OWNERID`          | Discord user ID of the bot owner.                                               |
| `BOT_MODE`         | Bot mode (`production`, `debug`, or `interactive`).                             |
| `LOG_TO_CONSOLE`   | Whether to log to the console (`true` or `false`).                              |
| `LOG_TO_FILE`      | Whether to log to a file (`true` or `false`).                                   |
| `HALT_ON_ERROR`    | Whether the bot should stop on errors (`true` or `false`).                      |
| `LOG_FILE`         | Path to the log file for bot logging.                                           |

---

## **How to Use Ben Bot**

### **Invite the Bot**
If you’re self-hosting Ben Bot, you can generate an invite link [here](https://kindkid27.github.io/Discord-Bot-Invite-Generator/#521875611201).   

### **Keyword Activations**
Ben Bot responds to specific keywords with pre-defined actions. Here are some examples:

| **Keyword**   | **Response Type** | **Description**                        |
|---------------|-------------------|----------------------------------------|
| `ben`         | Text              | Sends a picture of Ben Simmons         |
| `meow`        | Local File        | Sends a picture of a cat.              |

> Replace the above table with your bot’s actual keywords and responses.

### **Commands**
Ben Bot supports a variety of commands for users and admins:

#### **User Commands**
| Command               | Description                                       |
|-----------------------|---------------------------------------------------|
| `/message-visibility` |  Manage whether the bot can read your messages.   |

#### **Admin Commands**
| Command       | Description                                      |
|---------------|--------------------------------------------------|
| `/create`     | Create a new keyword activation.                 |
| `/read`       | Read data from the cache or database.            |
| `/update`     | Update an existing keyword activation.           |
| `/delete`     | Delete a keyword activation.                     |
| `/dropcache`  | Clear and update the cache manually.             |

---

## **Contributing**

We’d love your help to make Ben Bot even better! Here’s how you can contribute:

1. **Fork the Repository**: Click the "Fork" button on GitHub.
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/Ben-Network/Ben-Bot.git
   cd ben-bot
   ```
3. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes**: Add your feature or fix bugs.
5. **Test Your Changes**: Make sure everything works as expected.
6. **Submit a Pull Request**: Open a pull request with a detailed description of your changes.

### **Development Notes**
- **Key Files**:
  - `command-handler.js`: Handles loading and registering commands.
  - `cache-management.js`: Manages cache creation, backups, and restoration.
  - `database-operation.js`: Handles all MySQL database interactions.
  - `logger.js`: Handles non-essential logs.
- **Code Style**: Follow the ESLint rules defined in the project.

---

## **License**

Ben Bot is licensed under the **GNU General Public License v3.0**.  
This means:
- You’re free to use, modify, and distribute the code.
- Any modifications or forks must also be licensed under GPLv3.
- Proper attribution to the original project (Ben Network) is required.

For more details, see the LICENSE file.

---

## **Contact**

Need help or want to report an issue? Join our Discord server:  
[![Join Discord](https://img.shields.io/badge/Join-Discord-blue)](https://discord.gg/Zn7cnq49YJ)
