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

let mousePosition = { x: 0, y: 0 };

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
    if (zoom == 3) {
        return [x/coord_k + 6502, (0-y)/coord_k+6275];
    }
    else if (zoom == 2) {
        return [(x/coord_k + 6502)/2, (6277 + (0-y)/coord_k)/2];
    }
    else if (zoom == 1) {
        return [(x/coord_k + 6502)/4, (6277 + (0-y)/coord_k)/4];
    }
    else {
        return [(x/coord_k + 6502)/8, (6277 + (0-y)/coord_k)/8];
    }

}

var playersData = [];
var labelsoffset = {}; 
function getgamecoord (x,y){
    return [(x - 6506) * coord_k, -((y - 6277) * coord_k)];
}

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

    for (let i in data) {
        let player = data[i];
        if ( player.ATC !== null ) {
            
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
            // console.log(player);
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

//设置定时任务
// setInterval(
    function draw () {
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
            if (player.ATC === null) {
                playerLabel.innerHTML = player.playername  + '<br>' + '(' + player.vehiclemodel + ') '+ '<br>' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
            }
            else {
                playerLabel.innerHTML = player.playername  + '  [' + player.ATC.split(' ')[0] + ']<br>' + '(' + player.vehiclemodel + ') ' + Math.floor(player.croodz* 3.2808399) + 'ft'+" " + player.speed + 'kt';
            }
        }

        if (idents[player.playername] && player.inplane) {
            playerLabel.style.backgroundColor = 'yellow';
            playerLabel.style.color = 'green';   
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

function click (e) {
    if (e.target.className === 'player-label' || e.target.className === 'player-label in-plane') {
        // 如果点击的是玩家标签，触发玩家标签的拖动事件
        // console.log('label move');
        var playerLabel = e.target;
        document.onmousemove = function (e) {
            // 根据鼠标拖动更新labelsoffset
            labelsoffset[playerLabel.id].xoffset += e.movementX;
            labelsoffset[playerLabel.id].yoffset += e.movementY;
        }
    } else {
        // 否则，触发地图的拖动事件
        document.onmousemove = function (e) {
            if (mapimage && typeof mapimage.onMousemove === 'function') {
                mapimage.onMousemove(e);
                mapimage.isMousedown = true;  
            }
            // mapimage.onMousemove(e);
            // console.log('map move');  
            // mapimage.isMousedown = true;  
        }
    }
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
        
        mapimage.isMousedown = false;
        
    }
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
        let ctx = this.canvas.getContext('2d');
        // console.log(this.x, this.y);
        ctx.drawImage(this.img, this.x, this.y);
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
    


var mapimage = new Vue({
    // 对于<div class="map" ref="map">
    // 通过ref获取DOM元素
    // components: {
    //     'mouse-component': mouse
    // },
    mounted() {
        window.addEventListener("mousemove", this.onMousemove);
        
        window.addEventListener("mousewheel", this.onMousewheel);
        
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
            // console.log('map move');
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
            this.reload(x,y);

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
            // console.log(getgamecoord(mousex, mousey));
            // var mousegamecoord = getgamecoord(mousex, mousey);
            // var mouselater = getimagepx(mousegamecoord[0], mousegamecoord[1]);
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
        }
    }



}).$mount('#mapimage');

