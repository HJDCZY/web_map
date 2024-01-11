var websocket = new WebSocket("ws://hjdczy.top:2345/front");
websocket.onopen = function (evt) {
    console.log("Connected to WebSocket server.");
};
websocket.onclose = function (evt) {
    console.log("Disconnected");
};
let playerInfo = document.createElement('div');
websocket.onmessage = function (evt) {
    console.log('Retrieved data from server: ' + evt.data);
    let players = JSON.parse(evt.data);

    // 在这里处理数据...
    
    //将玩家数据以HTML显示在页面上
    let player = players[0];
    
    //删除上一次显示的HTML
    playerInfo.innerHTML = `
        <h2>${player.playername}</h2>
        <p>Coordinates: ${player.croodx}, ${player.croody}, ${player.croodz}</p>
        <p>Speed: ${player.speed}</p>
        <p>In plane: ${player.inplane}</p>
        <p>Server ID: ${player.serverid}</p>
    `;
    document.body.appendChild(playerInfo);     
};