var websocket = new WebSocket("ws://hjdczy.top:2345/front");
websocket.onopen = function (evt) {
    console.log("Connected to WebSocket server.");
};
websocket.onclose = function (evt) {
    console.log("Disconnected");
};
websocket.onmessage = function (evt) {
    console.log('Retrieved data from server: ' + evt.data);
    let players = JSON.parse(evt.data);

    // 在这里处理数据...
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        console.log('Player name: ' + player.playername);
        console.log('Coordinates: ' + player.croodx + ', ' + player.croody + ', ' + player.croodz);
        console.log('Speed: ' + player.speed);
        console.log('In plane: ' + player.inplane);
        console.log('Server ID: ' + player.serverid);
    }
    //将玩家数据以HTML显示在页面上
    let player = players[0];
    let playerInfo = document.createElement('div');
    playerInfo.innerHTML = `
        <h2>${player.playername}</h2>
        <p>Coordinates: ${player.croodx}, ${player.croody}, ${player.croodz}</p>
        <p>Speed: ${player.speed}</p>
        <p>In plane: ${player.inplane}</p>
        <p>Server ID: ${player.serverid}</p>
    `;
    document.body.appendChild(playerInfo);       
};