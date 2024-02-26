
RegisterNetEvent('webmap:senddata')
AddEventHandler('webmap:senddata', function(croodx, croody, croodz, speedinknot, inplane, playerserverid, playername, heading, vehiclemodel)
    -- 发送数据到mysql,如果不存在记录则插入，如果存在则更新
    MySQL.Async.execute('INSERT INTO webmap_players (croodx, croody, croodz, speed, inplane, serverid, playername, heading, vehiclemodel) VALUES (@croodx, @croody, @croodz, @speed, @inplane, @serverid, @playername, @heading, @vehiclemodel) ON DUPLICATE KEY UPDATE croodx = @croodx, croody = @croody, croodz = @croodz, speed = @speed, inplane = @inplane, playername = @playername, heading = @heading, vehiclemodel = @vehiclemodel', {
        ['@croodx'] = croodx,
        ['@croody'] = croody,
        ['@croodz'] = croodz,
        ['@speed'] = speedinknot,
        ['@inplane'] = inplane,
        ['@serverid'] = playerserverid,
        ['@playername'] = playername,
        ['@heading'] = heading,
        ['@vehiclemodel'] = vehiclemodel
    }, function(rowsChanged)
        -- print(playerserverid, playername)
    end)
end)

AddEventHandler('playerDropped', function (reason)
    local playerserverid = source
    MySQL.Async.execute('DELETE FROM webmap_players WHERE serverid = @serverid', {
        ['@serverid'] = playerserverid
    }, function(rowsChanged)
        -- print(rowsChanged)
    end)    
end)
    
RegisterNetEvent('webmap:ATC')
AddEventHandler ('webmap:ATC', function (args, serverid)
    -- 将args的元素连接成一个字符串，中间空格
    local message = table.concat(args, " ")
    -- print (message,serverid)
    --更新mysql
    MySQL.Async.execute('UPDATE webmap_players SET ATC = @ATC WHERE serverid = @serverid', {
        ['@ATC'] = message,
        ['@serverid'] = serverid
    }, function(rowsChanged)
        -- print(rowsChanged)
    end)
end)

RegisterNetEvent('webmap:ident')
AddEventHandler ('webmap:ident', function (playerserverid)
    --更新mysql
    MySQL.Async.execute('UPDATE webmap_players SET ident = @ident WHERE serverid = @serverid', {
        ['@ident'] = 1,
        ['@serverid'] = playerserverid
    }, function(rowsChanged)
        -- print(rowsChanged)
    end)
end)