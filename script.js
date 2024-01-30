// fivem本身就是个浏览器套壳

var ws_host = "hjdczy.top"
var ws_port = 2345
var ws;
var connected = false;

var croodx;
var croody;
var croodz;
var speed ;
var inplane;
var playerserverid;
var playername;

$(function(){
    // console.log("init");
    window.addEventListener('message', function(event) {
        var item = event.data;
        croodx = item.croodx;
        croody = item.croody;
        croodz = item.croodz;
        speed = item.speed;
        inplane = item.inplane;
        playerserverid = item.playerserverid;
        playername = item.playername;
        
    }
    );

    var ws = new WebSocket("wss://"+ws_host+":"+ws_port+"/ws");
    //ws = new WebSocket(`${pl}://${ws_host}:${ws_port}/`);
    ws.onopen = function(){
        console.log("websocket connect success");
        connected = true;
    }
    ws.onmessage = function(e){
        // 接收到服务器查询玩家的请求
        msg = JSON.parse(e.data);
        // console.log("websocket message:"+msg);
        var playsserveris = {};
        for(var i in msg){
            playsserveris[i] = msg[i];
        }
        // for (var i in playsserveris){
        //     console.log("serverid:"+playsserveris[i])
        // }
        //做NUI回调，把数据传给LUA
        fetch
    }
    ws.onclose = function(){
        console.log("websocket close");
        connected = false;
    }
    ws.onerror = function(){
        console.log("websocket error");
        connected = false;
    }
    
    setInterval(function(){
        if(connected){
            var data = {
                croodx:croodx,
                croody:croody,
                croodz:croodz,
                speed:speed,
                inplane:inplane,
                playerserverid:playerserverid,
                playername:playername
            };
            ws.send(JSON.stringify(data));
            // console.log("playername:"+playername);
        }
    },1000);

    
});
