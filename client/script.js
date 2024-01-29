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
    console.log('Retrieved data from server: ' + evt.data);
    let players = JSON.parse(evt.data);

    // 在这里处理数据...
    
    
     count +=1;
};