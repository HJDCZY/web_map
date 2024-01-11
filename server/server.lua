
-- 作为服务端接受fivem发来的websocket请求
local server = require "resty.websocket.server"
local wb, err = server:new{
    timeout = 5000, -- in milliseconds
    max_payload_len = 65535,
}
if not wb then
    ngx.log(ngx.ERR, "failed to new websocket: ", err)
    return ngx.exit(444)
end

local sqluser = "hjdczy"
local sqlpassword = "yoyo14185721"

-- serverid要特殊储存，关闭服务器时删除数据库中的记录
local playerserverid = nil
-- local players = {}
-- local player_count = 0
-- for i=1,50 do
--     players[i] = nil ;
-- end
-- player = {}
-- function player.new(crood,sped,inplane,serverid,playername)
--     local self = setmetatable({},player)
--     self.crood = crood
--     self.sped = sped
--     self.inplane = inplane
--     self.serverid = serverid
--     self.playername = playername
--     return self
-- end
-- function player:move(newcrood,newspeed,inplane)
--     self.crood = newcrood
--     self.speed = newspeed
--     self.inplane = inplane
-- end

-- 初始化mysql
local mysql = require "resty.mysql"
local db, err = mysql:new()
if not db then
    ngx.log(ngx.ERR, "failed to instantiate mysql: ", err)
    return
end
db:set_timeout(1000) -- 1 sec
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


-- 监听客户端消息
while true do
    local data, typ, err = wb:recv_frame()
    if wb.fatal then
        ngx.log(ngx.ERR, "failed to receive frame: ", err)
        return ngx.exit(444)
    end
    if not data then
        local bytes, err = wb:send_ping()
        if not bytes then
            ngx.log(ngx.ERR, "failed to send ping: ", err)
            return ngx.exit(444)
        end
    elseif typ == "close" then
        -- 删除数据库中的记录
        local res, err, errcode, sqlstate = db:query("delete from players where serverid = " .. playerserverid)
    elseif typ == "ping" then
        local bytes, err = wb:send_pong()
        if not bytes then
            ngx.log(ngx.ERR, "failed to send pong: ", err)
            return ngx.exit(444)
        end
    elseif typ == "pong" then
        -- do nothing
    elseif typ == "text" then
        -- 接收到客户端消息
        local msg = cjson.decode(data)
        ngx.log(ngx.INFO, "playername: ", msg.playername)
        playerserverid = msg.playerserverid
        -- 更新数据库，先查询serverid是否存在
        local res, err, errcode, sqlstate = db:query("select * from players where serverid = " .. msg.playerserverid)
        if next(res) == nil then
            -- 如果查询失败，说明数据库中没有这个serverid，插入一条新的记录
            local res, err, errcode, sqlstate = db:query("insert into players (serverid,playername) values (" .. msg.playerserverid .. ",'" .. msg.playername .. "')")
        else
            -- 如果查询成功，说明数据库中有这个serverid，更新记录的坐标和速度
            local res, err, errcode, sqlstate = db:query("update players set croodx = " .. msg.croodx .. ", croody = " .. msg.croody .. ", croodz = " .. msg.croodz .. ", speed = " .. msg.speed .. ", inplane = " .. msg.inplane .. " where serverid = " .. msg.playerserverid)
        end
    end
end