var websocket = new WebSocket("ws://hjdczy.top:2345/front");
websocket.onopen = function (evt) {
    console.log("Connected to WebSocket server.");
};
websocket.onclose = function (evt) {
    console.log("Disconnected");
};
let playerInfo = document.createElement('div');
var count  = 0;
websocket.onmessage = function (evt) {
    console.log('Retrieved data from server: ' + evt.data);
    let players = JSON.parse(evt.data);

    // 在这里处理数据...
    
    //将玩家数据以HTML显示在页面上
    let player = players[0];
    
    //删除上一次显示的HTML
    if 
    
    for (let i = 0; i < players.length; i++) {
        player = players[i];
        playerInfo = document.createElement('div');
        playerInfo.innerHTML = `name:${player.playername},coord:${player.croodx},${player.croody},${player.croodz},speed:${player.speed},ID:${player.serverid}`;
        document.body.appendChild(playerInfo);
    }
    
     count +=1;
};