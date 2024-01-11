
local playerped = GetPlayerPed(-1)
local playerserverid = GetPlayerServerId(PlayerId())

Citizen.CreateThread(function ()   
    while true do
        Citizen.Wait(10)
        -- 获得玩家坐标
        local crood = GetEntityCoords(playerped)
        local speed = GetEntitySpeed(playerped)
        local speedinknot = math.floor(speed * 1.9438444924574)
        -- 如果玩家在飞机上
        local inplane = IsPedInAnyPlane(playerped)
        local playername = GetPlayerName(PlayerId())
        -- 将坐标传给javascript
        SendNUIMessage({
            crood = crood,
            speed = speedinknot,
            inplane = inplane,
            playerserverid = playerserverid
            playername = playername
        })
    end
end)