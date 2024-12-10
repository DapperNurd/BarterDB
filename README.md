# **BarterDB**

_A two-party, anonymous bartering system._

---

## **Description**

Provide a brief overview of what your project does, its purpose, and why it's useful. Highlight key features and any relevant background information.  
For example:

-  **Purpose**: Allow users to, in a partnership, anonymously trade items with another party. 
-  **Key Features**:  
    - Secure account creation
    - Robust partnership system
    - Anonymous offering and requesting
    - Making counter offers on transactions

---

## **Installation**

Step-by-step instructions to get the project up and running locally.

1. Download and install the latest version of [NodeJs](https://nodejs.org/en).
2. Download and the latest version of the [MySQL installer](https://dev.mysql.com/downloads/installer/), and install both MySQL server and MySQL workbench. A MySQL server will need to be set up on the system you wish to connect to.
3. Clone the repository to your system.
```bash
  git clone https://github.com/DapperNurd/BarterDB/
```
4. By running the `barterdb.sql` file, initialize the database schema onto your MySQL server.
5. Create a ".env" file in the directory of your repository. Fill it with the following information:
```
  DB_HOST='(IP of where your MySQL Server was installed)'
  DB_USER='(Login username of your MySQL Server)'
  DB_PASS='(Login password of your MySQL Server)'

  SECRET="(Some secure string, can be anything)"
```
7. Open the project directory using a terminal.
8. Navigate to the server directory, install the required dependencies, and start the server.
```bash
  cd server
  npm install
  npm start
```
7. Navigate to the client directory, install the required dependencies, and start the client.
```bash
  cd client
  npm install
  npm start
```
