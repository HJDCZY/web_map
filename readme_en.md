# FiveM Web Map (fivem_web_map)
**[中文版 readme.md](README.md)**

this readme_en.md is translated by AI , so it may have some mistakes(not because I do not know English, just because I am lazy). If you find any mistakes, please feel free to submit a pull request.

Web_map is an online map for FiveM based on openresty, which allows viewing online players and server maps outside the game. The server mainly uses WebSocket and database implementation, and the backend code is implemented using Lua.

Initially, the online map was designed for air traffic controllers in our fivem flight simulation server. Most of the features are also centered around air traffic control. In the future, we will also strive to improve web_map into a universal tool that can be used for viewing online players on the server, server map viewing, and other functions.

[demo](https://hjdczy.top:2345)

## Installation
We tested the server using Ubuntu 22.04.

### Install OpenResty
OpenResty is a web server based on Nginx. It can use Lua to write backend code. We use it to implement WebSocket and Lua backend code.

For Linux systems, we recommend using precompiled packages of OpenResty, which you can download from [openresty](https://openresty.org/en/linux-packages.html). Our startup file `openresty.sh` is based on the precompiled package. If you compile OpenResty from source, you may need to modify the startup file.

You can use `systemctl status openresty` to check if OpenResty is installed successfully. (May require sudo)

### Connect to FiveM
Some files in the source code are required by FiveM, and some are required by the frontend browser. You can check in fxmanifest.lua for details. We recommend placing all files directly in the ~/server-data/resources/ folder.

This plugin's FiveM side depends on mysql-async to run, so you need to install mysql-async in advance.

(In previous versions, it did not depend on mysql-async, but used client WebSocket to directly connect to the server database. However, if this is done, due to the network stability of some players, the map will not display all players. So this version of the code has been deprecated. You can find this part of the code in `./script.js`)

You need to run `mysql.sql` to create the required database.

After placing the files on the server, you need to add `start web_map` to the server.cfg of FiveM to enable the FiveM side.

### Change the Configuration File

In `conf/nginx.conf`, you need to change the absolute paths of your Lua and HTML files, your port, and your SSL certificate path.
（this part
```
listen 2345 ssl;
ssl_certificate /hjdczy.top/cert/Nginx/hjdczy.top.pem;
ssl_certificate_key /hjdczy.top/cert/Nginx/hjdczy.top.key;
root /fivem_server/GTAV/server-data/resources/web_map/client;
content_by_lua_file /fivem_server/GTAV/server-data/resources/web_map/server/front.lua;
content_by_lua_file /fivem_server/GTAV/server-data/resources/web_map/server/server.lua;
```
of `conf/nginx.conf`）

You need to fill in the content of `config.json.example.~~` and rename it to `config.json`, placing it in the root directory of the project (same level as openresty.sh).

You need to change your server address in the first line of `client/script.js` to make WebSocket connect to your server.

You can change the links
```     
<div>
    <a href="https://hjdczy.top:333/">百科</a>
    <a href="http://175.24.205.80:2333/status/serverinfo">状态</a>
</div>
```
 in `client/index.html` to the ones you want.

You can use `openresty -p ` pwd`/ -c conf/nginx.conf` to start the server, or directly run the openresty.sh I wrote, and run `stop.sh` to stop the server.

### Create Map Image Hosting (Optional)
We have developed a simple map engine ourselves to display the map. You can find our map hosting address in `/client/script.js` at line 525(image.src = `https://hjdczy.top:3307/mydevice/webmap/${zoom}/${j}/${i}.png`;) and line 671( image.src = `https://hjdczy.top:3307/mydevice/webmap/${this.zoom}/${col + j}/${row + i}.png`;). If you want to change it to your own image source, you can change it to your own source address. Our map hosting structure has been packaged into `./webmap.zip`, and you can create your own map hosting following our map hosting structure, where 0, 1, 2, 3 are zoom levels, and the pixel size of each image is 1500*1500. You need to cut the images yourself. The original images are placed in `./map.png` and `./air_chart_ver3.png`.

## Usage
Note: The online map has not been optimized for mobile devices. Please use a device with a mouse to open the website.

After installation, you can enter `https://your_server_address:your_port` in the browser to access the online map.

The effect is as follows:
![alt text](image.png)

### Features
#### On the map page, you can:
- Drag the map by holding down the mouse.
- Zoom in and out using the mouse wheel.
- Press H to center.
- Quickly double-click the mouse, then drag after the second click to draw a trajectory line between two points. The midpoint of the trajectory line displays the angle and distance between the two endpoints (the distance is in meters in the game coordinates).

#### For player game tags, you can:
- When the mouse is on the player tag, you can drag the player tag by holding down the mouse. (This feature is very useful when different player tags overlap)
- When the player is not in an aircraft, the player tag is black. Otherwise, it is pink and displays information.
- If there are parentheses after the player's name, it indicates the name of the vehicle the player is currently driving.
- When the player is in an aircraft, the player tag is pink and displays the following information (sorted from top to bottom, left to right):
    - Player name
    - Parentheses: name of the vehicle the player is driving
    - Player altitude above sea level (in feet)
    - Player speed (in knots)
    - Player speed estimate line: When the player has a certain speed, you will see a line segment extending from the player's position point (red dot, not tag). This is the speed estimate line.
        - The length of the speed estimate line changes with the player's speed. The greater the player's speed, the longer the speed estimate line.
        - The direction of the speed estimate line is the same as the current heading of the player.
        - The speed estimate line can be used by air traffic controllers to judge whether unassigned vertical separations between aircraft have a risk of collision. If the speed estimate line of the latter aircraft is significantly longer than that of the former aircraft, it may indicate a risk of collision, and action needs to be taken.

### Player and Controller Interaction
For players:
- Players can send messages (usually flight plans) to the online map by entering the command `/ATC [... ...]` in the game (where `[... ...]` is the text content, with spaces between the command and the text content). Controllers can view this message by placing the mouse over the player tag and pressing the space bar. Click elsewhere with the left mouse button to close.
- Players can simulate identifying their transponder by entering `/ident` in the game. After the player identifies their transponder, on the online map, the player's tag will be highlighted for 5 seconds to remind the controller.
- Players can Set their transponder code with `/squawk [4-digit octal number]`. Special codes like 7500, 7600, and 7700 display in different colors.

### July 28, 2024 Update
Added pinch zoom and drag support for touch devices. However, due to performance limitations, tag loading pauses when fingers touch the screen, and the map's frame rate is capped at 30 FPS.

### October 5, 2024 Update
Added transponder functionality and updated tag display. Now, only the call sign is shown if available, and either the call sign or the name is displayed (but not both).


## Unresolved Bugs
1. Sometimes, there are multiple records of the same player with increasing server IDs in the database, which do not exist in the game.
2. Sometimes when players quit the game, their player records in the database are not successfully deleted.

We are working hard to solve these problems. If you have a solution, please feel free to submit a pull request.

