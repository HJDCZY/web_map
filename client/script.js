var websocket = new WebSocket("wss://hjdczy.top:2345/front");
websocket.onopen = function (evt) {
    console.log("Connected to WebSocket server.");
};
websocket.onclose = function (evt) {
    console.log("Disconnected");
};
websocket.onerror = function (evt) {
    console.log("Error to connect to WebSocket server");
};

var mapContainer = document.getElementById('mapContainer'); // 获取地图容器

websocket.onmessage = function (evt) {
    var playersData = JSON.parse(evt.data);

    // 清空地图容器，以便重新添加玩家位置
    mapContainer.innerHTML = '';

    playersData.forEach(function(player, i) {
        console.log("Player Number: " + i);
        console.log("Server ID: " + player.serverid);
        console.log("Player Name: " + player.playername);
        console.log("Coordinates (X, Y, Z): " + player.croodx + ", " + player.croody + ", " + player.croodz);
        console.log("In Plane: " + (player.inplane === 1 ? "Yes" : "No"));
        console.log("Speed: " + player.speed);

        // 创建玩家名称标签
        var playerLabel = document.createElement('div');
        playerLabel.className = 'player-label';
        playerLabel.innerHTML = player.playername;

        // 将玩家坐标映射到百分比，适应地图容器的大小
        var leftPercentage = mapCoordinateToPercentage(player.croodx, -10000, 10000);
        var topPercentage = mapCoordinateToPercentage(player.croody, -10000, 10000);

        // 设置玩家名称标签的位置
        playerLabel.style.left = leftPercentage + '%';
        playerLabel.style.top = topPercentage + '%';

        // 将玩家名称标签添加到地图容器中
        mapContainer.appendChild(playerLabel);
    });
};

// 将地图坐标映射到百分比
function mapCoordinateToPercentage(coordinate, min, max) {
    return ((coordinate - min) / (max - min)) * 100;
}