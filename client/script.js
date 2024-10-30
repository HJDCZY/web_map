var websocket = new WebSocket("wss://hjdczy.top:2345/front");
websocket.onopen = function (evt) {
    console.log("Connected to WebSocket server.");
    //使得id = sockettimedout隐藏
    document.getElementById('sockettimedout').style.display = 'none';
};
websocket.onclose = function (evt) {
    console.log("Disconnected");
    //使得id = sockettimedout显示
    document.getElementById('sockettimedout').style.display = 'block';
};
websocket.onerror = function (evt) {
    console.log("Error to connect to WebSocket server");
};
// //引入vue3
// import { createApp } from 'vue'
// import Mouse from './Mouse.vue'
var coord_k = 1.806 //原坐标1.806代表地图1像素
var images = {};
let zoom = 0;
let touchPoints = false;

let mousePosition = { x: 0, y: 0 };

let devicetype = 'mouse';
// 检测是否为触摸设备
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// 检测是否为鼠标设备
function isMouseDevice() {
    return 'onmousemove' in window || 'onmousedown' in window;
}

// 输出设备类型检测结果
function outputDeviceType() {
    const touch = isTouchDevice();
    const mouse = isMouseDevice();

    if (touch && mouse) {
        console.log('当前设备既支持触摸也支持鼠标');
        devicetype = 'touch&mouse';
    } else if (touch) {
        console.log('当前设备是触摸设备');
        devicetype = 'touch';
    } else if (mouse) {
        console.log('当前设备是鼠标设备');
        devicetype = 'mouse';
    } else {
        console.log('当前设备既不支持触摸也不支持鼠标');
        devicetype = 'none';
    }
}

// 调用函数输出设备类型
outputDeviceType();

// 全局监听 mousemove 事件，保存鼠标的位置
document.onmousemove = function (e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
}

function getimagepx (x,y){
    //从游戏坐标转换到图片坐标

        //原图片为12000*12000像素
        //游戏坐标原点位于地图的6506,6277

        //玩家在地图中的像素 x 为 玩家X/1.806 + 6506
        //对于GTA，右上为XY正方向
        //玩家在地图中的像素 y 为 6277 + 玩家Y/1.806
        //地图左上为0，右下为正
        //经修正，修正为6502,6275

    //上面是前三版航图，第四版航图扩大到了30000*30000像素
    //游戏坐标原点位于地图的15851, 8629
    //上面是前四版航图，第五版航图扩大到了36000*36000像素
    //游戏坐标原点位于地图的18672, 17732
    var zero = [18790, 17790];
    if (zoom == 3) {
        return [x/coord_k + zero[0], (0-y)/coord_k+zero[1]];
    }
    else if (zoom == 2) {
        return [(x/coord_k + zero[0])/2, (zero[1] + (0-y)/coord_k)/2];
    }
    else if (zoom == 1) {
        return [(x/coord_k + zero[0])/4, (zero[1] + (0-y)/coord_k)/4];
    }
    else {
        return [(x/coord_k + zero[0])/8, (zero[1] + (0-y)/coord_k)/8];
    }

}

var playersData = [];
var labelsoffset = {}; 

function db_refresh() {
    //通过websocket发送消息
    websocket.send(JSON.stringify({type: 'refresh'}));
}

var mapContainer = document.getElementById('mapContainer'); // 获取地图容器
var center = [0, 0];
let playerlist = {};
websocket.onmessage = function (evt) {
    let data = JSON.parse(evt.data);
    if (data.type == 'ident'){
        // console.log(data);
        ident(data.playername, data.playerserverid);
    }
    if (!Array.isArray(data)) {
        data = [data];
    }
    // console.log(data);
    playersData = data;
    //更新玩家数据表，给<div class="dropdown-content" id="onlineplayersdropdown">添加数据项
    let dropdowncontent = document.getElementById('onlineplayersdropdown');
    dropdowncontent.innerHTML = '';
    let table = document.createElement('table');
    let tableheader = document.createElement('tr');
    let tableheadername = document.createElement('th');
    tableheadername.innerHTML = '玩家';
    let tableheadercallsign = document.createElement('th');
    tableheadercallsign.innerHTML = '呼号';
    tableheader.appendChild(tableheadername);
    tableheader.appendChild(tableheadercallsign);
    table.appendChild(tableheader);

    //处理没有玩家的情况，data为空
    // console.log(data.length);
    if (data.length == 0) {
        return;
    }

    for (let i in data) {
        let player = data[i];
        // console.log(player.playername);
        if (player.playername === undefined) {
            continue;
        }
        else if ( player.ATC !== null && player.ATC !== undefined && player.ATC !== '' && player.ATC !== ' ') {
            // console.log(player);
            let playername = player.playername;
            let playeritem = document.createElement('tr');
            //截取data.ATC空格为分隔的第一个元素
            // console.log(player.ATC); 
            callsign = player.ATC.split(' ')[0];
            let playernameitem = document.createElement('td');
            playernameitem.innerHTML = playername;
            let playercallsignitem = document.createElement('td');
            playercallsignitem.innerHTML = callsign;
            playeritem.appendChild(playernameitem);
            playeritem.appendChild(playercallsignitem);
            table.appendChild(playeritem);
        }
        else 
        {
            let playername = player.playername;
            let playeritem = document.createElement('tr');
            let playernameitem = document.createElement('td');
            playernameitem.innerHTML = playername;
            let playercallsignitem = document.createElement('td');
            playercallsignitem.innerHTML = '/';
            playeritem.appendChild(playernameitem);
            playeritem.appendChild(playercallsignitem);
            table.appendChild(playeritem);
        }
    }

    

    dropdowncontent.appendChild(table);



};

let idents = {};    
function ident(playername,playerserverid) {
    // console.log(playername);
    //等待1秒
    setTimeout(() => {
    //     发送消息给服务器
        websocket.send(JSON.stringify({type: 'identcallback', playername: playername, playerserverid: playerserverid}));
    }, 500);
    //闪烁标签
    let label = document.getElementById(playername);
    // console.log(label);
    idents[playername] = true;
    setTimeout(() => {
        idents[playername] = false;
    }, 5000);

}



let lastCallTime = 0;
const fps = 30; // 每秒帧数
const frameDuration = 1000 / fps;



function draw () {
    const now = Date.now();
    const elapsed = now - lastCallTime;


    //触控移动和玩家点的加载不能同时进行，因为性能问题，当没有触控点的时候，才加载玩家点
    if (elapsed > frameDuration && touchPoints === false) {
        lastCallTime = now;

        // mapimage.reload(0,0);
        mapContainer.innerHTML = ''; // 清空地图容器以便重新绘制
        // console.log('draw');
        playersData.forEach(function(player) {
            // console.log(player); 
            var playerPoint = document.createElement('div');
            playerPoint.className = 'player-point';

            var playerLabel = document.createElement('div');
            playerLabel.className = 'player-label';
            //给予id，后面拖动好定位
            playerLabel.id = player.playername;
            if (player.vehiclemodel != 'CARNOTFOUND' && player.inplane != 1) {
                playerLabel.innerHTML = player.playername + '(' + player.vehiclemodel + ')' ;  
            }
            else {
                playerLabel.innerHTML = player.playername ;
            }
            playerLabel.style.userSelect = 'none';

            if (player.inplane === 1) {
                playerLabel.classList.add('in-plane');
                // console.log(player.squawk);
                if ((player.ATC === null || player.ATC === '' || player.ATC === ' ' || player.ATC === undefined) && player.squawk === 0) {    
                    playerLabel.innerHTML = player.playername  + '<br>' + '(' + player.vehiclemodel + ') '+ '<br>' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
                }
                else if ((player.ATC === null || player.ATC === '' || player.ATC === ' ' || player.ATC === undefined)) {
                    playerLabel.innerHTML = player.playername  + "[" + player.squawk + ']' + '<br>' + '(' + player.vehiclemodel + ') '+ '<br>' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
                }
                else if (player.squawk !== 0 && (player.ATC !== null && player.ATC !== '' && player.ATC !== ' ' && player.ATC !== undefined)) {
                    playerLabel.innerHTML = player.ATC.split(' ')[0] + '[' + player.squawk + ']' + '<br>' + '(' + player.vehiclemodel + ') ' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
                }
                else if ((player.ATC !== null && player.ATC !== '' && player.ATC !== ' ' && player.ATC !== undefined) && player.squawk === 0) {
                    playerLabel.innerHTML =   player.ATC.split(' ')[0] + '<br>' + '(' + player.vehiclemodel + ') ' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
                }
                else {
                    playerLabel.innerHTML = player.playername + '<br>' + '(' + player.vehiclemodel + ') '+ '<br>' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
                }
            }

            if (idents[player.playername] && player.inplane) {
                playerLabel.style.backgroundColor = 'yellow';
                playerLabel.style.color = 'green';   
            }
            if (player.squawk === 7500&& player.inplane) {
                playerLabel.style.backgroundColor = 'green';
                playerLabel.style.color = 'white';
            }
            if (player.squawk === 7600&& player.inplane) {
                // 0039D7
                playerLabel.style.backgroundColor = '#0039D7';
                playerLabel.style.color = 'white';
            }
            if (player.squawk === 7700&& player.inplane) {
                playerLabel.style.backgroundColor = 'red';
                playerLabel.style.color = 'white';
            }

            var pxcoord = getimagepx(player.croodx, player.croody);
            var leftpxcoord = pxcoord[0] - center[0];
            var toppxcoord = pxcoord[1] - center[1];

            if (leftpxcoord > 0 && leftpxcoord < window.innerWidth && toppxcoord > 0 && toppxcoord < window.innerHeight) {
                // 设置点的位置
                playerPoint.style.left = leftpxcoord + 'px';
                playerPoint.style.top = toppxcoord + 'px';

                // 标签位置调整
                // 如果没有设置偏移量，则默认为80, -100
                if (!labelsoffset[player.playername]) {
                    labelsoffset[player.playername] = {
                        xoffset: 80,
                        yoffset: -100
                    };
                }
                // playersData.labelOffsetX = 80; // X轴偏移量
                // playersData.labelOffsetY = -100; // Y轴偏移量
                var labelOffsetX = labelsoffset[player.playername].xoffset;
                var labelOffsetY = labelsoffset[player.playername].yoffset;
                playerLabel.style.left = (leftpxcoord + labelOffsetX) + 'px'; // 标签右移
                playerLabel.style.top = (toppxcoord + labelOffsetY) + 'px'; // 标签上移

                mapContainer.appendChild(playerPoint);
                mapContainer.appendChild(playerLabel);

                // SVG 绘制连接线
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.style.position = "absolute";
                svg.style.left = "0px";
                svg.style.top = "0px";
                svg.style.width = "100%";
                svg.style.height = "100%";
                svg.style.zIndex = "0";

                var line = document.createElementNS('http://www.w3.org/2000/svg','line');

                line.setAttribute('x1', leftpxcoord+3);
                line.setAttribute('y1', toppxcoord +3);
                line.setAttribute('x2', leftpxcoord + labelOffsetX + playerLabel.offsetWidth / 2);
                line.setAttribute('y2', toppxcoord + labelOffsetY  + playerLabel.offsetHeight / 2);
                line.setAttribute('stroke', '#000000');
                line.setAttribute('stroke-width', '2');

                svg.appendChild(line);
                mapContainer.appendChild(svg);

                //绘制速度预计线
                if (player.inplane === 1) {
                    var speedsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    speedsvg.style.position = "absolute";
                    speedsvg.style.left = "0px";
                    speedsvg.style.top = "0px";
                    speedsvg.style.width = "100%";
                    speedsvg.style.height = "100%";
                    speedsvg.style.zIndex = "0";

                    var speedline = document.createElementNS('http://www.w3.org/2000/svg','line');
        
                    //根据玩家的朝向和速度，计算画线的终点
                    // console.log(360-player.heading);
                    heading = 360 - player.heading;
                    //根据速度计算x分量
                    // console.log(player.speed);
                    // console.log(3-zoom);
                    var speedx = (Math.sin(heading * Math.PI / 180) * player.speed)/(Math.pow(2,3-zoom));
                    //根据速度计算y分量
                    var speedy = -((Math.cos(heading * Math.PI / 180) * player.speed)/(Math.pow(2,3-zoom)));
                    // console.log(speedx, speedy);

                    
                    //绘制
                    speedline.setAttribute('x1', leftpxcoord+3);
                    speedline.setAttribute('y1', toppxcoord +3);
                    speedline.setAttribute('x2', leftpxcoord + speedx+3);
                    speedline.setAttribute('y2', toppxcoord + speedy+3);
                    speedline.setAttribute('stroke', '#FF0000');
                    speedline.setAttribute('stroke-width', '2');

                    speedsvg.appendChild(speedline);
                    mapContainer.appendChild(speedsvg);
                }
                //鼠标可以拖动标签
                // playerLabel.onmousedown = function (e) {

                //     document.onmousemove = function (e) {
                //         // 根据鼠标拖动更新labelsoffset
                //         labelsoffset[player.playername].xoffset += e.movementX ;
                //         labelsoffset[player.playername].yoffset += e.movementY;
                //     }
                //     document.onmouseup = function () {
                //         document.onmousemove = null;
                //         document.onmouseup = null;
                //     }
                // }
            }
            //检测ATC的更新，如果更新了，就闪一下标签
        

        });
    }

    // console.log("ticking");
    requestAnimationFrame(draw);
}
// , 10); 
requestAnimationFrame(draw);

//当鼠标放在标签上按下空格时，显示ATC内容
document.onkeydown = function (e) {
    if (e.key === ' ') {
        // console.log(e);
        //绘制的元素和draw_line绘制在同一层
        draw_line.innerHTML = '';
        ATCmessage = document.createElement('div');
        //获取鼠标下的标签
        // console.log(mousePosition);
        let currentplayer = document.elementFromPoint(mousePosition.x, mousePosition.y);
        // console.log(currentplayer);
        if (currentplayer.className === 'player-label' || currentplayer.className === 'player-label in-plane') {
            
            currentplayer = currentplayer.id;
            // console.log(currentplayer); 
            //在playersdata中搜索
            for (let i in playersData) {
                if (playersData[i].playername === currentplayer) {
                    // console.log('find');
                    // console.log(playersData[i]);
                    ATCmessage.innerHTML = playersData[i].ATC;
                    // console.log(ATCmessage.innerHTML);
                    break;
                }
            }
            ATCmessage.id = 'ATCmessage';
            ATCmessage.style.position = 'absolute';
            ATCmessage.style.left = mousePosition.x + 'px';
            ATCmessage.style.top = mousePosition.y + 'px';
            draw_line.appendChild(ATCmessage);
        }
    }
}

window.addEventListener("mouseup", function (e) {
    clearTimeout(mousetimeout); 
    document.onmousemove = function (e) {
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;
    }
    document.onmouseup = null;
    mapimage.isMousedown = false;
    draw_line.innerHTML = '';
    // console.log('mouseup'); 
});
let clicktimer = 0 ;


let mousebefore = [0, 0];
document.onmousedown = function (e) {
    // 检查鼠标点击的元素
    
    //如果距离上一次点击时间小于100ms，则认为是双击
    clicktimer ++;
    if (clicktimer == 1) {
        // console.log('click');
        mousebefore = [e.clientX, e.clientY];
    }
    mousetimeout = setTimeout(() => {
        if (clicktimer == 1) {
            // console.log('click');
            click(e);
        } else {
            // console.log('dblclick');
            dblclick(e);
        }
        clicktimer = 0;
    }, 100)
}

function click(e) {

        // 非触摸设备处理
    if (devicetype === 'mouse' || devicetype === 'touch&mouse') {
        if (e.target.classList.contains('player-label') || e.target.classList.contains('player-label in-plane')) {
            var playerLabel = e.target;

            // 添加鼠标移动事件监听器，处理玩家标签的拖动
            document.onmousemove = function (e) {
                labelsoffset[playerLabel.id].xoffset += e.movementX;
                labelsoffset[playerLabel.id].yoffset += e.movementY;
            };
        } else {
            // 添加全局鼠标移动事件监听器，用于地图拖动
            document.onmousemove = function (e) {
                if (mapimage && typeof mapimage.onMousemove === 'function') {
                    mapimage.onMousemove(e);
                    mapimage.isMousedown = true;
                }
            };
        }
    }
    //  if (devicetype === 'touch&mouse') {
    //     if (e.target.classList.contains('player-label') || e.target.classList.contains('player-label in-plane')) {
    //         var playerLabel = e.target;

    //         // 添加触摸移动事件监听器
    //         playerLabel.addEventListener('touchmove', function (e) {
    //             e.preventDefault(); // 阻止默认的触摸事件，避免页面滚动或缩放
    //             var touch = e.touches[0];
    //             labelsoffset[playerLabel.id].xoffset += touch.clientX - labelsoffset[playerLabel.id].lastX;
    //             labelsoffset[playerLabel.id].yoffset += touch.clientY - labelsoffset[playerLabel.id].lastY;
    //             labelsoffset[playerLabel.id].lastX = touch.clientX;
    //             labelsoffset[playerLabel.id].lastY = touch.clientY;
    //         });
    //     } else {
    //         // 添加全局触摸移动事件监听器，用于地图拖动
    //         document.addEventListener('touchmove', function (e) {
    //             e.preventDefault(); // 阻止默认的触摸事件，避免页面滚动或缩放
    //             if (mapimage && typeof mapimage.onTouchmove === 'function') {
    //                 mapimage.onTouchmove(e);
    //                 mapimage.isMousedown = true;
    //             }
    //         });
    //     }
    // }

    // 添加鼠标释放事件监听器，解除绑定
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
        if (mapimage) {
            mapimage.isMousedown = false;
        }
    };
}

//处理触摸设备
//阻止浏览器原本的双指缩放和单指滚动

if (devicetype === 'touch' || devicetype === 'touch&mouse') {


    
        
    document.addEventListener('touchstart', function (e) {
        if (e.touches.length > 1) {
            // 阻止双指缩放
            e.preventDefault();
        }
    }, { passive: false });



    document.addEventListener('touchmove', function (e) {
        if (e.touches.length > 1) {
            // 阻止双指缩放
            e.preventDefault();
        } else if (e.touches.length === 1) {
            // 阻止单指滚动
            e.preventDefault();
        }
    }, { passive: false });

    //处理触摸设备

    document.addEventListener('touchstart', function (e) {

    // document.ontouchstart = function (e) {
        // console.log('touchstart');
        if (devicetype === 'touch&mouse' || devicetype === 'touch') {
            //如果是单指，等0.1秒，如果没有第二个触摸点，则认为是单击
            if (e.touches.length == 1) {
                // console.log('touchstart');
                touchtimer = setTimeout(() => {
                    // 重新获取触摸点的数量
                    if (e.targetTouches.length == 1) {
                        singletouch(e);
                    }
                }, 100);
            } else if (e.touches.length == 2) {
                // 处理双指触摸
                clearTimeout(touchtimer); // 清除单指触摸的计时器
                doubletouch(e);
            }
        } 
    // }
    });
}



function singletouch(e) {
    //单指移动
    //如果点在了玩家标签上，那么移动标签
    console.log('singletouch');
    if (e.target.classList.contains('player-label') || e.target.classList.contains('player-label in-plane')) {
        var playerLabel = e.target;

        // 添加触摸移动事件监听器，处理玩家标签的拖动
        document.ontouchmove = function (e) {
            var touch = e.touches[0];
            labelsoffset[playerLabel.id].xoffset += touch.clientX - playerLabel.startX;
            labelsoffset[playerLabel.id].yoffset += touch.clientY - playerLabel.startY;
            playerLabel.startX = touch.clientX;
            playerLabel.startY = touch.clientY;
        };

        // 记录初始触摸点
        var touch = e.touches[0];
        playerLabel.startX = touch.clientX;
        playerLabel.startY = touch.clientY;
    } 
}


//记录初始时的两个手指位置，如果两个手指距离与初始距离相差超过100px，则认为是双指缩放
let touchdistanceinitial = 0;
//因为手指移动的函数会多次调用，所以需要一个变量来记录当前的缩放级别
let currentzoom = 0;
//手指没有movementX，movementY，所以需要记录初始位置
let lastTouchX = 0;
let lastTouchY = 0;
//记录点下去的时候画布的位置
let canvasx = 0;
let canvasy = 0;
function doubletouch(e) {
    console.log('doubletouch');
    touchPoints = true;
    //记录两手指间的距离
    let touch1 = e.touches[0];
    let touch2 = e.touches[1];
    touchdistanceinitial = Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
    // console.log(touchdistanceinitial);
    currentzoom = mapimage.zoom;
    lastTouchX = (touch1.clientX + touch2.clientX) / 2;
    lastTouchY = (touch1.clientY + touch2.clientY) / 2;
    canvasx = mapimage.center[0];
    canvasy = mapimage.center[1];
    // console.log(canvasx, canvasy);

    
    document.addEventListener('touchmove', function (e) {
        
        requestAnimationFrame(function() {
            if (mapimage && typeof mapimage.ontouchmove === 'function') {
                // console.log('touchmove');
                mapimage.ontouchmove(e);
                mapimage.isTouchdown = true;
            }
            
        });
        doubletouchmove = true;
        doubletouche = e;
    }, { passive: false });

   
    document.addEventListener('touchend', function () {
        // console.log('touchend');
        doubletouchmove = false;
        touchPoints = false;
    });

    document.addEventListener('touchcancel', function () {
        // console.log('touchcancel');
        doubletouchmove = false;
    });
        
}





//读取<div class="draw-line">
let draw_line = document.getElementById('draw_line');

function calculateDistance(distancepx) {
    if (zoom == 3) {
        return distancepx * coord_k;
    }
    else if (zoom == 2) {
        return distancepx * coord_k * 2;
    }
    else if (zoom == 1) {
        return distancepx * coord_k * 4;
    }
    else {
        return distancepx * coord_k * 8;
    }   
}   

function dblclick (e) {
    //document.ondblclick  = function (e) {
    //双击之后拖动
    // console.log('dblclick');
    this.isMousedown = true;
    
    // console .log(mousebefore);
    let mouseoffset = [0, 0];
    let offsetX = 0, offsetY = 0;
    document.onmousemove = function (e) {
        // 计算本次拖动的距离对应像素
        draw_line.innerHTML = '';
        offsetX += e.movementX;
        offsetY += e.movementY;
        //绘制连线
        // console.log(offsetX, offsetY);
        let dbsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");  
        let dbl = document.createElementNS('http://www.w3.org/2000/svg','line');
        dbsvg.style.position = "absolute";
        dbsvg.style.left = "0px";
        dbsvg.style.top = "0px";
        dbsvg.style.width = "100%";
        dbsvg.style.height = "100%";
        dbsvg.style.zIndex = "0"; 
        dbl.setAttribute('x1', mousebefore[0]);
        dbl.setAttribute('y1', mousebefore[1]);
        dbl.setAttribute('x2',  mousebefore[0] + offsetX);
        dbl.setAttribute('y2',  mousebefore[1] + offsetY);
        dbl.setAttribute('stroke', '#000000');
        dbl.setAttribute('stroke-width', '2');
        dbsvg.appendChild(dbl);

        // 将两点距离显示在线上方
        let distance = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
        let distanceText = document.createElement('div');
        distanceText.id = 'distanceText';
        distanceText.style.position = 'absolute';
        distanceText.style.left = mousebefore[0]+ offsetX/2 -20 + 'px';
        distanceText.style.top = mousebefore[1] + offsetY/2  -20+ 'px';
        distanceText.style.zIndex = '1';
        //显示方向沿着线的方向
        let angle = Math.atan2(offsetY, offsetX) * 180 / Math.PI;
        // console.log(angle);
        //不能倒转
        if (angle < -90 || angle > 90){
            angle += 180;
        }
        distanceText.style.transform = 'rotate(' + angle + 'deg)';
        distanceText.style.fontSize = '12px';
        distanceText.style.color = '#000000';   
        
        //显示两点之间角度
        let angleTextcache = Math.atan2(offsetY, offsetX) * 180 / Math.PI;
        let angleText = angleTextcache;
        if (angleTextcache < -90) {
            angleText= angleTextcache+ (360+90);
        }
        else if (angleTextcache <180 && angleTextcache > -90) {
            angleText= angleTextcache+ 90;
        }
        distanceText.innerHTML = Math.floor( calculateDistance(distance.toFixed(2))) + 'm  ' +angleText.toFixed(2) + '°';
        draw_line.appendChild(distanceText);



        draw_line.appendChild(dbsvg);
    }
    
}



// 将地图坐标映射到百分比
function mapCoordinateToPercentage(coordinate, min, max) {
    return ((coordinate - min) / (max - min)) * 100;
}

// new Vue({
//     el: '#vue-test',
//     data: {
//         message: 'Hello World'
//     }
// });

//瓦片缓存
class imageCache {
    constructor(row,col,zoom,x,y,url,img,canvas) {
        //行列号
        this.row = row;
        this.col = col;
        //缩放级别
        this.zoom = zoom;
        //显示位置
        this.x = x;
        this.y = y; 
        this.url = url;
        this.img = img;
        this.cacheKey = this.row + '_' + this.col + '_' + this.zoom;
        this.canvas = canvas;   
    }

    //渲染
    render () {
        // let ctx = this.canvas.getContext('2d');
        // console.log(this.img);
        // ctx.drawImage(this.img, this.x, this.y);

        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            let ctx = this.canvas.getContext('2d');
            // console.log(this.img);
            ctx.drawImage(this.img, this.x, this.y);
        } else {
            console.error('Image is not loaded or is broken:', this.img);
        }
    }
    
    load () {
        let image = new Image();
        image.src = this.url;
        image.onload =() => {
            this.img = image;
            this.render();
        }
        image.onerror = () => {
            // console.log('error');
            //采用默认图片
            let defaultImage = new Image();
            defaultImage.src = 'backup.png';
            defaultImage.onload = () => {
                this.img = defaultImage;
                this.render();
            }
        }
            

    }


    update (x,y) {
        this.x = x;
        this.y = y;
        this.render();
    }
}
    
//正数变1，负数变-1
function sign(x) {
    if (x > 0) {
        return 1;
    }
    else if (x < 0) {
        return -1;
    }
    else {
        return 0;
    }
}

var mapimage = new Vue({
    // 对于<div class="map" ref="map">
    // 通过ref获取DOM元素
    // components: {
    //     'mouse-component': mouse
    // },
    mounted() {
        window.addEventListener("mousemove", this.onMousemove);
        
        window.addEventListener("mousewheel", this.onMousewheel);

        // window.addEventListener("touchstart", this.ontouchstart);
        // window.addEventListener("touchend", this.ontouchend);
        
        //按H回中
        window.addEventListener("keydown", (e) => {
            if (e.key === 'h') {
                center = [0, 0];
                this.zoom = 0;
                zoom = this.zoom;
                this.clear();
                this.reload(0,0);
            }
        });
        let canvas = this.$refs.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx = canvas.getContext('2d');


        //获取浏览器像素再除以图片像素1500
        let rownum = Math.ceil( window.screen.height / 1500);
        let colnum = Math.ceil( window.screen.width / 1500);
        //使用双重循环加载瓦片
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < colnum; j++) {
                let image = new Image();
                image.src = `https://hjdczy.top:3307/mydevice/webmap/${zoom}/${j}/${i}.png`;
                // console.log(image.src);
                //渲染到canvas
                // image.onload = function () {
                //     ctx.drawImage(image, j * 1500, i * 1500);
                // }

                //缓存
                images[i + '_' + j + '_' + zoom] = new  imageCache(i,j,zoom,j*1500,i*1500,image.src,image,canvas);
                images[i + '_' + j + '_' + zoom].load();
            }
        }
    },

    //mouse move
    data(){
        return {
            isMousedown: false,
            zoom: 0,
            maxzoom : 3,
            minzoom : 0,
            center: [0, 0]  ,
            isTouchdown: false,

        }
    },
    methods: {
        // 鼠标按下
        onMousedown(e) {
            if (e.which === 1) {
                // console.log(e);
                this.isMousedown = true;
            }
            // console.log(center[0], center[1]);
        },

        // 鼠标移动
        onMousemove(e) {           
            if (!this.isMousedown) {
                return;
            }
            // console.log('mapmove');
            // 计算本次拖动的距离对应像素
            let offsetX = e.movementX;
            let offsetY = e.movementY;
            // 获取canvas元素
            let canvas = this.$refs.canvas;
            let ctx = canvas.getContext('2d');
            // 清除画布 
            this.clear();   
            x = this.center[0] - offsetX;   
            // console.log(x);
            y = this.center[1] - offsetY;
            // console.log(x, y);
            this.reload(x,y);

        },

        ontouchmove(e) {
            // console.log('touchmove');
            if (!this.isTouchdown) {
                return;
            }
            //如果是双指,有缩放地图和拖动地图的功能
            if  (e.touches.length == 2) {
                //处理双指缩放
                //时刻监测两手指间的距离
                //每300像素为一个单位
                let zoomchange = 0;
                let touchdistance =  Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
                // console.log(touchdistance - touchdistanceinitial);

                if (touchdistance - touchdistanceinitial > 0){
                zoomchange = Math.floor((touchdistance - touchdistanceinitial) / 300);
                }
                else if (touchdistance - touchdistanceinitial < 0){
                    zoomchange = Math.ceil((touchdistance - touchdistanceinitial) / 300);
                }

                // console.log(currentzoom + zoomchange);
                //更改zoom
                if (currentzoom + zoomchange <= this.maxzoom && currentzoom + zoomchange >= this.minzoom) {
                    // console.log(currentzoom + zoomchange);
                    this.zoom = currentzoom + zoomchange;
                    
                    // console.log(zoomchange);
                    // console.log(this.zoom, zoom);
                    
                }
                else if (currentzoom + zoomchange > this.maxzoom) {
                    this.zoom = this.maxzoom;
                    zoom = this.zoom;
                }
                else if (currentzoom + zoomchange < this.minzoom) {
                    this.zoom = this.minzoom;
                    zoom = this.zoom;
                }




                //仅在zoom改变时执行
                
                if (zoom != this.zoom){
                    zoom = this.zoom;
                    //缩放时，保持两个手指的中心点不变
                    let fingercenterx = (e.touches[0].clientX + e.touches[1].clientX) / 2 +center[0];
                    let fingercentery = (e.touches[0].clientY + e.touches[1].clientY) / 2 +center[1];

                    // console.log(Math.pow(2, zoomchange));
                    fingercenterx = fingercenterx * (Math.pow(2, sign(zoomchange)));
                    fingercentery = fingercentery * (Math.pow(2, sign(zoomchange)));
                    console.log(fingercenterx, fingercentery);
                    center[0] = fingercenterx - (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    center[1] = fingercentery - (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    this.center = [center[0], center[1]];
                    // console.log(center);
                    this.clear();
                    this.reload(0,0);


                        //记录两手指间的距离
                    let touch1 = e.touches[0];
                    let touch2 = e.touches[1];

                    lastTouchX = (touch1.clientX + touch2.clientX) / 2;
                    lastTouchY = (touch1.clientY + touch2.clientY) / 2;
                    canvasx = mapimage.center[0];
                    canvasy = mapimage.center[1];



                }
                // 没有缩放时，拖动，因为它们不能在同一帧内执行
                else{
                                    //处理拖动
                    //以两个手指的中心点计算
                    let fingercenterx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    let fingercentery = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    // console.log(fingercenterx, fingercentery);

                    // 根据当前位置相对于刚点击时的位置计算偏移量
                    let offsetX = fingercenterx - lastTouchX;
                    let offsetY = fingercentery - lastTouchY;

                    // 获取canvas元素
                    let canvas = this.$refs.canvas;
                    let ctx = canvas.getContext('2d');
                    // 清除画布
                    
                    // console.log(offsetX, offsetY);
                    
                    //因为这个函数会一直触发，xy要针对一开始点下去的位置计算
                    x = canvasx - offsetX;
                    y = canvasy - offsetY;
                    // console.log(x, y);
                    this.clear();
                    center = [x, y];
                    this.center = [x, y];
                    this.reloadInPosition(x,y);
                }

            }


        
        },

        ontouchup() {
            this.isTouchdown = false;
            console.log('touchup');
        },


        // 鼠标松开
        onMouseup() {
            this.isMousedown = false;
        },

        clear() {
            let canvas = this.$refs.canvas;
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },

        onMousewheel(e) {
            // console.log(e.clientX, e.clientY);
            // console.log(center);
            mousex = center[0] + e.clientX;
            mousey = center[1] + e.clientY;
            // console.log(mousex, mousey);

            if (e.deltaY > 0) {
                // 层级变小
                if (this.zoom > this.minzoom) {
                    this.zoom--;
                    //保持鼠标位置不变
                    mousex = mousex /2;
                    mousey = mousey /2;
                    center[0] = mousex - e.clientX;
                    center[1] = mousey - e.clientY;
                    zoom = this.zoom;
                }
            } else {
                // 层级变大
                if (this.zoom < this.maxzoom) {
                    mousex = mousex *2;
                    mousey = mousey *2;
                    center[0] = mousex - e.clientX;
                    center[1] = mousey - e.clientY;
                    this.zoom++;
                    zoom = this.zoom;
                }
            }
            this.clear();
            this.reload(0,0);
        },
        // onMousewheel(e) {
        //     // 计算鼠标位置相对于地图的坐标
        //     let mouseX = e.clientX - this.center[0];
        //     let mouseY = e.clientY - this.center[1];

        //     if (e.deltaY > 0) {
        //         // 层级变小
        //         if (this.zoom > this.minzoom) {
        //             this.zoom--;
        //             zoom = this.zoom;
        //         }
        //     } else {
        //         // 层级变大
        //         if (this.zoom < this.maxzoom) {
        //             this.zoom++;
        //             zoom = this.zoom;
        //         }
        //     }

        //     // 在缩放地图后，调整地图的位置以保持鼠标位置相对于地图的坐标不变
        //     this.center[0] = e.clientX - mouseX / this.zoom;
        //     this.center[1] = e.clientY - mouseY / this.zoom;

        //     this.reload(0,0);
        // },

        //传入的x,y是偏移量
        reload(x,y){
            //左上角是x,y
            let canvas = this.$refs.canvas;
            //判断要加载的瓦片
            let row = Math.floor( center[1] / 1500);
            let col = Math.floor( center[0] / 1500);    
            // console.log(row,col);
            let ctx = canvas.getContext('2d');
            let rownum = Math.ceil( window.screen.height / 1500)+1;
            let colnum = Math.ceil( window.screen.width / 1500)+1;  
            //更新中心点
            center = [center[0] + x, center[1] + y];
            for (let i = 0; i < rownum; i++) {
                for (let j = 0; j < colnum; j++) {
                    let image = new Image();
                    if (row + i < 0 || col + j < 0) {
                        continue;
                    }
                    image.src = `https://hjdczy.top:3307/mydevice/webmap/${this.zoom}/${col + j}/${row + i}.png`;
                    // console.log(image.src);

                    //读取缓存
                    var currentcachekey = (row + i) + '_' + (col + j) + '_' + this.zoom;
                    if (images[currentcachekey]) {
                        // console.log(row , i, col , j);
                        // console.log(center);
                        // console.log(-(center[0] - (col + j) * 1500),-( center[1] - (row + i) * 1500));
                        // if ((col+ j) == 0 || (i+row) == 0) { 
                            // images[currentcachekey].update((col+ j) * 1500 - center[0] % 1500, (i+row) * 1500 - center[1] % 1500);
                            images[currentcachekey].update(-(center[0] - (col + j) * 1500),-( center[1] - (row + i) * 1500));
                        // }
                        // else {
                        //     images[currentcachekey].update(j * 1500 - center[0] % 1500, i * 1500 - center[1] % 1500);
                        // }
                    } else {
                        images[currentcachekey] = new imageCache(i, j, this.zoom, j * 1500 - center[0] % 1500, i * 1500 - center[1] % 1500, image.src, image, canvas);
                        images[currentcachekey].load();
                    }

                    // image.onload = function () {
                    //     //挪位置
                    //     // console.log(center);
                    //     ctx.drawImage(image, j * 1500 - center[0] % 1500, i * 1500 - center[1] % 1500);
                    // }
                }
            }
        },
        reloadInPosition(absX, absY) {
            // 更新中心点为绝对位置
            center = [absX, absY];
        
            let canvas = this.$refs.canvas;
            let row = Math.floor(center[1] / 1500);
            let col = Math.floor(center[0] / 1500);
            let ctx = canvas.getContext('2d');
            let rownum = Math.ceil(window.screen.height / 1500) + 1;
            let colnum = Math.ceil(window.screen.width / 1500) + 1;
        
            for (let i = 0; i < rownum; i++) {
                for (let j = 0; j < colnum; j++) {
                    let image = new Image();
                    if (row + i < 0 || col + j < 0) {
                        continue;
                    }
                    image.src = `https://hjdczy.top:3307/mydevice/webmap/${this.zoom}/${col + j}/${row + i}.png`;
        
                    // 读取缓存
                    var currentcachekey = (row + i) + '_' + (col + j) + '_' + this.zoom;
                    if (images[currentcachekey]) {
                        images[currentcachekey].update(-(center[0] - (col + j) * 1500), -(center[1] - (row + i) * 1500));
                    } else {
                        images[currentcachekey] = new imageCache(i, j, this.zoom, j * 1500 - center[0] % 1500, i * 1500 - center[1] % 1500, image.src, image, canvas);
                        images[currentcachekey].load();
                    }
                }
            }
        }

    }



}).$mount('#mapimage');

