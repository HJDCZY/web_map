
Citizen.CreateThread(function ()   
    local playerserverid = GetPlayerServerId(PlayerId())   
    while true do
        local playerped = GetPlayerPed(-1)
        if playerserverid == nil then
            playerserverid = GetPlayerServerId(PlayerId())
        end
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
        local speedinknot = math.floor(speed * 1.9438444924574) or 0
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
        if not (playerserverid == nil or playername  == nil) then
            TriggerServerEvent('webmap:senddata', croodx, croody, croodz, speedinknot, inplane, playerserverid, playername, heading, vehiclemodel)
        end

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

RegisterCommand ('squawk', function(source, args, rawCommand)
    local playerserverid = GetPlayerServerId(PlayerId())
    -- print (args[1])
    -- 验证输入应为4个8进制数字
    if args[1] == nil or args[1] == "" then
        TriggerEvent('chat:addMessage', {
            color = { 255, 0, 0},
            multiline = true,
            args = {"[ATC]", "请输入4位8进制数的应答机代码"}
        })
        return
    end
    local squawk = args[1]
    -- 验证4位数都是0-7
    print (squawk)
    if string.match(squawk, "[0-7][0-7][0-7][0-7]") == nil then
        TriggerEvent('chat:addMessage', {
            color = { 255, 0, 0},
            multiline = true,
            args = {"[ATC]", "请输入4位8进制数的应答机代码"}
        })
        return
    end
    local squawkcode = tonumber(squawk)
    print (squawkcode)
    TriggerServerEvent('webmap:squawk', playerserverid, squawkcode)
end, false)
