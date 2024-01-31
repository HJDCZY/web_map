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
        console.log(
            "Player Number: " + i + "\n" +
            "Server ID: " + player.serverid + "\n" +
            "Player Name: " + player.playername + "\n" +
            "Coordinates (X, Y, Z): " + player.croodx + ", " + player.croody + ", " + player.croodz + "\n" +
            "In Plane: " + (player.inplane === 1 ? "Yes" : "No") + "\n" +
            "Speed: " + player.speed + "\n"+
            "heading: " + player.heading + "\n"+
            "vehiclemodel: " + player.vehiclemodel + "\n"
        );

        // 创建玩家位置点
        var playerDot = document.createElement('div');
        playerDot.className = 'player-dot';

        var leftPercentage = mapCoordinateToPercentage(player.croodx, -10000, 10000);
        var topPercentage = mapCoordinateToPercentage(player.croody, -10000, 10000);

        var invertedTopPercentage = 100 - topPercentage;

        // 设置玩家位置点的位置
        playerDot.style.left = leftPercentage + '%';
        playerDot.style.top = invertedTopPercentage + '%';

        // 创建玩家名称标签
        var playerLabel = document.createElement('div');
        playerLabel.className = 'player-label';
        playerLabel.innerHTML = player.playername;

        // 在飞机上
        if (player.inplane === 1) {
            playerLabel.classList.add('in-plane');
        }

        // 设置玩家名称标签的位置
        playerLabel.style.left = leftPercentage + '%';
        playerLabel.style.top = invertedTopPercentage - 10 + '%'; // 将标签上移一些，以避免与点重叠

        // 创建连接线
        var line = document.createElement('div');
        line.className = 'connecting-line';

        // 设置连接线的位置
        line.style.left = leftPercentage + '%';
        line.style.top = (invertedTopPercentage - 6) + '%';
        line.style.height = '40px'; // 调整线的长度，根据需要调整

        // 添加到地图中
        mapContainer.appendChild(playerDot);
        mapContainer.appendChild(playerLabel);
        mapContainer.appendChild(line);

    });
};

// 将地图坐标映射到百分比
function mapCoordinateToPercentage(coordinate, min, max) {
    return ((coordinate - min) / (max - min)) * 100;
}