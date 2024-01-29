var websocket = new WebSocket("wss://hjdczy.top:2345/front");
websocket.onopen = function (evt) {
    console.log("Connected to WebSocket server.");
};
websocket.onclose = function (evt) {
    console.log("Disconnected");
};
websocket.onerror = function (evt) {
    console.log("Error to connect to websocket server");
};  
let playerInfo = document.createElement('div');
var count  = 0;
websocket.onmessage = function (evt) {

    let players = JSON.parse(evt.data);
    
    for (let i = 0; i < playerData.length; i++) {
        let player = playerData[i];

        console.log("Player Number: " + i);
        console.log("Server ID: " + player.serverid);
        console.log("Player Name: " + player.playername);
        console.log("Coordinates (X, Y, Z): " + player.croodx + ", " + player.croody + ", " + player.croodz);
        console.log("In Plane: " + (player.inplane === 1 ? "Yes" : "No"));
        console.log("Speed: " + player.speed);

        // 在这里处理每个玩家的数据...
    }
    
    
     count +=1;
};