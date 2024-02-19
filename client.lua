
Citizen.CreateThread(function ()   
    while true do
        local playerped = GetPlayerPed(-1)
        local playerserverid = GetPlayerServerId(PlayerId())
        Citizen.Wait(250)
        -- 获得玩家坐标
        local crood = GetEntityCoords(playerped)
        local croodx = crood.x
        local croody = crood.y
        local croodz = crood.z
        -- print (croodx, croody, croodz)
        -- local retval , speedx, speedy =GetPedCurrentMovementSpeed(playerped)
        -- -- 仅计算水平速度
        -- print (speedx, speedy)
        -- local speed = math.sqrt(speedx*speedx + speedy*speedy)
        -- print (speed)
        local speed = GetEntitySpeed(playerped)
        local speedinknot = math.floor(speed * 1.9438444924574)
        -- 如果玩家在飞机上
        local inplane = IsPedInAnyPlane(playerped)
        local playername = GetPlayerName(PlayerId())
        -- 获得玩家航向
        local heading = GetEntityHeading(playerped)
        --获得玩家载具的model
        local vehicle = GetVehiclePedIsIn(playerped, false)
        --获得载具名字
        local vehiclemodel = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle))
        -- print (vehiclemodel)

        -- 检查数据，必须都不是nil 
        -- print("name" .. playername)
        if croodx == nil or croody == nil or croodz == nil or speedinknot == nil or inplane == nil or playerserverid == nil or playername == nil then
            send = false
        elseif croodx == 0 or croody == 0 or croodz == 0 then
            send = false
        else
            send = true
        end
        TriggerServerEvent('webmap:senddata', croodx, croody, croodz, speedinknot, inplane, playerserverid, playername, heading, vehiclemodel)
    end
end)

-- RegisterNUICallback('checkplayer', function(data, cb)
--     -- print (json.encode(data))
--     if GetPlayerFromServerId(data) ~= -1 then
--         -- print ("player exists")
--         cb(true)
--     else
--         -- print ("player not exists")
--         cb(false)
--     end
-- end)

-- 给webmap发送数据
RegisterCommand('ATC', function(source, args, rawCommand)
    -- for ipairs, v in ipairs(args) do
    --     print (v)
    -- end
    local playerserverid = GetPlayerServerId(PlayerId())
    TriggerServerEvent('webmap:ATC', args,playerserverid)
end, false)

RegisterCommand ('ident', function(source, args, rawCommand)
    local playerserverid = GetPlayerServerId(PlayerId())
    TriggerServerEvent('webmap:ident', playerserverid)
end, false)