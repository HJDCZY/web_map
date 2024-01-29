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
        console.log(e.data);
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
