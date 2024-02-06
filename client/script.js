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
// //引入vue3
// import { createApp } from 'vue'
// import Mouse from './Mouse.vue'
var coord_k = 1.806 //原坐标1.806代表地图1像素
var images = {};
let zoom = 0;

function getimagepx (x,y){
    //从游戏坐标转换到图片坐标

    //原图片为12000*12000像素
    //游戏坐标原点位于地图的6506,6277

    //玩家在地图中的像素 x 为 玩家X/1.806 + 6506
    //对于GTA，右上为XY正方向
    //玩家在地图中的像素 y 为 6277 + 玩家Y/1.806
    //地图左上为0，右下为正
    if (zoom == 3) {
        return [x/coord_k + 6506, (0-y)/coord_k+6277];
    }
    else if (zoom == 2) {
        return [(x/coord_k + 6506)/2, (6277 + (0-y)/coord_k)/2];
    }
    else if (zoom == 1) {
        return [(x/coord_k + 6506)/4, (6277 + (0-y)/coord_k)/4];
    }
    else {
        return [(x/coord_k + 6506)/8, (6277 + (0-y)/coord_k)/8];
    }

}

var playersData = [];
function getgamecoord (x,y){
    return [(x - 6506) * coord_k, -((y - 6277) * coord_k)];
}

var mapContainer = document.getElementById('mapContainer'); // 获取地图容器
var center = [0, 0];
websocket.onmessage = function (evt) {
    let data = JSON.parse(evt.data);
    if (!Array.isArray(data)) {
        data = [data];
    }

    playersData = data;
    // 清空地图容器，以便重新添加玩家位置
    
};

//设置定时任务
setInterval(function () {
    mapContainer.innerHTML = ''; // 清空地图容器以便重新绘制

    playersData.forEach(function(player) {
        var playerPoint = document.createElement('div');
        playerPoint.className = 'player-point';

        var playerLabel = document.createElement('div');
        playerLabel.className = 'player-label';
        playerLabel.innerHTML = player.playername;

        if (player.inplane === 1) {
            playerLabel.classList.add('in-plane');
        }

        var pxcoord = getimagepx(player.croodx, player.croody);
        var leftpxcoord = pxcoord[0] - center[0];
        var toppxcoord = pxcoord[1] - center[1];

        if (leftpxcoord > 0 && leftpxcoord < window.innerWidth && toppxcoord > 0 && toppxcoord < window.innerHeight) {
            // 设置点的位置
            playerPoint.style.left = leftpxcoord + 'px';
            playerPoint.style.top = toppxcoord + 'px';

            // 标签位置调整
            var labelOffsetX = 80; // X轴偏移量
            var labelOffsetY = -100; // Y轴偏移量
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

            line.setAttribute('x1', leftpxcoord + 12);
            line.setAttribute('y1', toppxcoord - 3);
            line.setAttribute('x2', leftpxcoord + labelOffsetX);
            line.setAttribute('y2', toppxcoord + labelOffsetY + playerLabel.offsetHeight); // 标签的下方作为终点
            line.setAttribute('stroke', '#000000');
            line.setAttribute('stroke-width', '2');

            svg.appendChild(line);
            mapContainer.appendChild(svg);
        }
    });
}, 5); // 5秒刷新一次，请检查刷新频率是否合理

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
    


new Vue({
    // 对于<div class="map" ref="map">
    // 通过ref获取DOM元素
    // components: {
    //     'mouse-component': mouse
    // },
    mounted() {
        window.addEventListener("mousemove", this.onMousemove);
        window.addEventListener("mouseup", this.onMouseup);
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
                console.log(image.src);
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

