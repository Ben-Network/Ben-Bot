# **Ben Bot**

![License](https://img.shields.io/badge/License-GPLv3-blue)  
![Discord.js](https://img.shields.io/badge/Discord.js-v14.18.0-blue)  
![MySQL](https://img.shields.io/badge/MySQL-Required-red)  
![Contributions](https://img.shields.io/badge/Contributions-Encouraged-brightgreen)

Ben Bot is a fun and versatile Discord bot developed by **Ben Network**. What started as an inside joke in 2024 has grown into a fully open-source project. Ben Bot is packed with features like keyword activations, MySQL integration, and a caching system, making it perfect for developers and server admins who want to add some flair to their Discord servers.

---

## **Table of Contents**
1. [Features](#features)
2. [Security and Privacy](#security-and-privacy)
3. [How to Set Up Ben Bot](#how-to-set-up-ben-bot)
4. [How to Use Ben Bot](#how-to-use-ben-bot)
5. [Contributing](#contributing)
6. [License](#license)
7. [Contact](#contact)

---

## **Features**

- **Keyword Activations**: Responds to specific keywords with text, local files, or web files.
- **Slash Commands**: Includes commands for both users and admins to manage bot behavior.
- **MySQL Integration**: Stores and manages keyword activations in a database.
- **Cache Management**: Reduces database queries with an optimized caching system.
- **Security-Focused**: No personal user data is stored, ensuring privacy.
- **Self-Hosting**: Fully open-source and easy to host on your own.

---

## **Security and Privacy**

Ben Bot is designed with your privacy in mind:
- **No Personal Data**: The bot doesn’t store personal user data, except for ignored users (to respect their preferences).
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
     HOST="your-mysql-host"
     USER="your-mysql-username"
     PASSWORD="your-mysql-password"
     DATABASE="your-database-name"
     BOTTOKEN="your-discord-bot-token"
     BOTID="your-discord-bot-id"
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

## **How to Use Ben Bot**

### **Invite the Bot**
If you’re hosting Ben Bot, you can invite it to your server using this link:  
[**Invite Ben Bot**](https://discord.com/oauth2/authorize?client_id=1199941494518325339&permissions=8&scope=bot%20applications.commands)

### **Keyword Activations**
Ben Bot responds to specific keywords with pre-defined actions. Here are some examples:

| **Keyword**   | **Response Type** | **Description**                        |
|---------------|--------------------|---------------------------------------|
| `ben`         | Text              | Responds with "Hello, world!"          |
| `cat`         | Local File        | Sends a picture of a cat.              |

> Replace the above table with your bot’s actual keywords and responses.

### **Commands**
Ben Bot supports a variety of commands for users and admins:

#### **User Commands**
| Command               | Description                                       |
|------------------------|--------------------------------------------------|
| `/message-readability` | Manage whether the bot can read your messages.   |

#### **Admin Commands**
| Command       | Description                                      |
|---------------|--------------------------------------------------|
| `/create`     | Create a new keyword activation.                 |
| `/read`       | Read data from the cache or database.            |
| `/update`     | Update an existing keyword activation.           |
| `/delete`     | Delete a keyword activation.                     |
| `/drop-cache` | Clear and update the cache manually.             |

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
- **Testing**: Use `npm test` to run tests with Jest.
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
