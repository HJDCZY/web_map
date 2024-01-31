// fivem本身就是个浏览器套壳

var ws_host = "hjdczy.top"
var ws_port = 2345
var ws;

var croodx;
var croody;
var croodz;
var speed ;
var inplane;
var playerserverid;
var playername;
let playerexists = {};

$(function(){
    // console.log("init");
    window.addEventListener('message', function(event) {
        var item = event.data;
        croodx = item.croodx;
        croody = item.croody;
        croodz = item.croodz;
        speed = item.speed;
        heading = item.heading;
        vehiclemodel = item.vehiclemodel;
        inplane = item.inplane;
        playerserverid = item.playerserverid;
        playername = item.playername;
        
    }
    );
    function connectwebsocket (){
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
            var playersserverids = {};
            for(var i in msg){
                playersserverids[i] = msg[i];
            }
            // for (var i in playersserverids){
            //     console.log("serverid:"+playersserverids[i])
            // }
            //做NUI回调，把数据传给LUA
            let promises = [];
            for (let i in playersserverids){
                
                let promise = fetch(`https://${GetParentResourceName()}/checkplayer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                    },
                    body: JSON.stringify(playersserverids[i]),
                }).then(function(response) {
                    return response.json();
                }).then(function(data) {
                    playerexists[i] = data;
                    // console.log(i + ' '+ playersserverids[i] + ' ' +playerexists[i]);
                });
                promises.push(promise);
            }
            //所有请求都完成后，发送数据给服务器
            Promise.all(promises).then(function(){
                if (connected){
                    var data = {
                        type: 'checkothers',
                        playerexists:playerexists,
                        playerserverids:playersserverids
                    };
                    ws.send(JSON.stringify( data ));
                }
            });
        }
        ws.onclose = function(event){
            console.log("websocket close, code: " + event.code + ", reason: " + event.reason);
            

            // 重连
            setTimeout(function() {
                connectwebsocket();
            }, 5000); // 5秒后尝试重连
            

        };

        ws.onerror = function(){
            console.log("websocket error");
        };
        // 发送数据
        let senddataid =  setInterval(function(){
            if(ws.readyState == 1){
                var data = {
                    type: 'playerdata',
                    croodx:croodx,
                    croody:croody,
                    croodz:croodz,
                    speed:speed,
                    heading:heading,
                    vehiclemodel:vehiclemodel,
                    inplane:inplane,
                    playerserverid:playerserverid,
                    playername:playername
                };
                ws.send(JSON.stringify(data));
                // console.log("playername:"+playername);
            }
            else{
                clearInterval(senddataid);
            }
        },1000);
    }
    connectwebsocket();
    


    // 关闭窗口时主动关闭websocket
    window.addEventListener('beforeunload', function(event) {
        ws.close();
    });

    
});
