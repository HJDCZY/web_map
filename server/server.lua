require "time"
local connected = false
-- 作为服务端接受fivem发来的websocket请求
local server = require "resty.websocket.server"
local cjson = require "cjson"
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
-- ngx.log(ngx.INFO, "connected to mysql.")

-- 向客户端请求检查其他玩家，只查一次

-- ngx.log (ngx.INFO, "checkothers thread started.")

-- 查询所有玩家的serverid和并存入数组
function queryallplayers()
    
    local queryplayers = {}
    local res, err, errcode, sqlstate = db:query("select serverid from players")
    -- print (cjson.encode(res))
    if not res then
        ngx.log(ngx.ERR, "bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
        return
    end
    for i, row in ipairs(res) do
        queryplayers[i] = row.serverid
    end
    -- ngx.log(ngx.INFO, "queryplayers: ", cjson.encode(queryplayers))
    -- 请求客户端
    -- print (cjson.encode(queryplayers))

    local bytes, err = wb:send_text(cjson.encode(queryplayers))
    -- print (cjson.encode(queryplayers))

    if not bytes then
        ngx.log(ngx.ERR, "failed to send text: ", err)
        
    end
end
queryallplayers()



-- 监听客户端消息
while true do

    --每两分钟检查一次其他玩家
    if time.gettime() % 120 == 0 then
        queryallplayers()
    end  

    local data, typ, err = wb:recv_frame()
    if wb.fatal then
        -- ngx.log(ngx.ERR, "failed to receive frame: ", err)
        -- 主动删除玩家
        if playerserverid ~= nil then
            local res, err, errcode, sqlstate = db:query("delete from players where serverid = " .. playerserverid)
            return ngx.exit(444)
        elseif playername ~= nil then
            local res, err, errcode, sqlstate = db:query("delete from players where playername = '" .. playername .. "'")
            return ngx.exit(444)
        end
    end
    if not data then
        local bytes, err = wb:send_ping()
        if not bytes then
            ngx.log(ngx.ERR, "failed to send ping: ", err)
            return ngx.exit(444)
        end
    elseif typ == "close" then
        -- 删除数据库中的记录
        if playerserverid ~= nil then
            local res, err, errcode, sqlstate = db:query("delete from players where serverid = " .. playerserverid)
        elseif playername ~= nil then
            local res, err, errcode, sqlstate = db:query("delete from players where playername = '" .. playername .. "'")
        end
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
        -- ngx.log(ngx.INFO, "playername: ", msg.playername, "serverid", msg.playerserverid)
        if msg.type == 'playerdata' then
            playerserverid = msg.playerserverid
            if msg.playername ~= nil then 
                -- 更新数据库，先查询serverid是否存在
                local res, err, errcode, sqlstate = db:query("select * from players where serverid = " .. msg.playerserverid .. " and playername = '" .. msg.playername .. "'" )
                if  not res or next(res) == nil then
                    -- 删除与serverid对应的记录
                    local res, err, errcode, sqlstate = db:query("delete from players where serverid = " .. msg.playerserverid)
                    -- 删除所有与playername对应的记录
                    local res, err, errcode, sqlstate = db:query("delete from players where playername = '" .. msg.playername .. "'")
                    -- 如果查询失败，说明数据库中没有这个serverid，创建新的记录
                    local res, err, errcode, sqlstate = db:query("insert into players (croodx, croody, croodz, speed, inplane, serverid, playername,heading,vehiclemodel) values (" .. msg.croodx .. ", " .. msg.croody .. ", " .. msg.croodz .. ", " .. msg.speed .. ", " .. tostring(msg.inplane) .. ", " .. msg.playerserverid .. ", '" .. msg.playername .. "'," .. msg.heading .. ",'" .. msg.vehiclemodel .. "')")
                    if not res then
                        ngx.log(ngx.ERR, "bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
                        return
                    end
                else
                    -- 如果查询成功，说明数据库中有这个serverid，更新记录的坐标和速度，和朝向和载具
                    local res, err, errcode, sqlstate = db:query("update players set croodx = " .. msg.croodx .. ", croody = " .. msg.croody .. ", croodz = " .. msg.croodz .. ", speed = " .. msg.speed .. ", inplane = " .. tostring(msg.inplane) .. ", heading = " .. msg.heading .. ", vehiclemodel = '" .. msg.vehiclemodel .. "' where serverid = " .. msg.playerserverid .. " and playername = '" .. msg.playername .. "'")
                end
            end
        elseif msg.type == "checkothers" then
            -- print ("checkothers")
            local playerserverid = msg.playerserverids
            local playerexists = msg.playerexists
            -- print (cjson.encode(playerserverid))    
            -- print (cjson.encode(playerexists))
            -- 对于数组中的每个玩家，根据playerexists检查数据库
            for i,serverid in pairs(playerserverid) do
                
                -- 删除数据库中不存在的玩家
                -- 如果玩家不存在
                if playerexists[i] == false then
                    print (playerserverid[i] .. " not exists")
                    local res, err, errcode, sqlstate = db:query("delete from players where serverid = " .. playerserverid[i])
                end
            end
        end
    end
end
