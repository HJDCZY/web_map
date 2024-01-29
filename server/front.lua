-- ngx.say("<p>hello world from front</p>")
-- 为网页前端的javascript提供websocket服务

-- 服务器端的websocket服务
local server = require "resty.websocket.server"
local cjson = require "cjson"
local wb, err = server:new{
    timeout = 20000, -- in milliseconds
    max_payload_len = 65535,
}
if not wb then
    ngx.log(ngx.ERR, "failed to new websocket: ", err)
    return ngx.exit(444)
end
local connected = true

-- TODO: 修改硬编码
local sqluser = "hjdczy"
local sqlpassword = "yoyo14185721" -- 为什么要硬编码 （测试是这样的）
ngx.log(ngx.INFO, "connected to websocket.")
local players = {}
local player_count = 0
for i=1,50 do
    players[i] = nil ;
end
local player = {}
function player.new(croodx,croody,croodz,speed,inplane,serverid,playername)
    local self = setmetatable({},player)
    self.croodx = croodx
    self.croody = croody
    self.croodz = croodz
    self.speed = speed
    self.inplane = inplane
    self.serverid = serverid
    self.playername = playername
    return self
end
function player:move(newcroodx,newcroody,newcroodz,newspeed,inplane)
    self.croodx = newcroodx
    self.croody = newcroody
    self.croodz = newcroodz
    self.speed = newspeed
    self.inplane = inplane
end



    
-- TODO: 要做的活更多了（同上修改应编码）
-- 初始化mysql
local mysql = require "resty.mysql"
local db, err = mysql:new()
if not db then
    ngx.log(ngx.ERR, "failed to instantiate mysql: ", err)
    return
end
db:set_timeout(20000)
ngx.log(ngx.INFO, "try to connect to mysql.")
local ok, err, errcode, sqlstate = db:connect{
    host = "127.0.0.1",
    port = 3306,
    database = "fivem_web_map",
    user = sqluser,
    password = sqlpassword,
    charset = "utf8",
    max_packet_size = 1024 * 1024,
}
if not ok then
    ngx.log(ngx.ERR, "failed to connect: ", err, ": ", errcode, " ", sqlstate)
    return
end
ngx.log(ngx.INFO, "connected to mysql.")

local function querydatabase()
    -- 查询数据库,并将所有结果写入palyer[]中
    local res, err, errcode, sqlstate = db:query("select * from players")
    if not res then
        ngx.log(ngx.ERR, "bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
        return false
    end
    player_count = 0
    -- 清空players
    for i=1,50 do
        players[i] = nil ;
    end
    for i, row in ipairs(res) do
        player_count = player_count + 1
        players[i] = player.new(row["croodx"],row["croody"],row["croodz"],row["speed"],row["inplane"],row["serverid"],row["playername"])
    end
    return true
end
local function send_data()
    local data = cjson.encode(players)
    local bytes, err = wb:send_text(data)
    if not bytes then
        -- ngx.log(ngx.ERR, "failed to send text: ", err)
        return ngx.exit(444)
    end
    return true
end

-- 作为服务端接受浏览器发来的websocket请求
while true do
    
    
    if not querydatabase() then
        ngx.log(ngx.ERR, "failed to query database")
        return ngx.exit(444)
    end
    if not send_data() then
        ngx.log(ngx.ERR, "failed to send data")
        return ngx.exit(444)
    end
    -- 一秒钟发送一次数据
    ngx.sleep(1)

    
end
local ok, err = db:close()
if not ok then
    ngx.log(ngx.ERR, "failed to close: ", err)
    return
end