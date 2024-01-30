-- 创建名为fivem_web_map的数据库

CREATE DATABASE IF NOT EXISTS fivem_web_map DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
-- 创建players表

-- 选择fivem_web_map数据库
USE fivem_web_map;

CREATE TABLE IF NOT EXISTS `players` (
  -- double的croodx,croody,croodz
    `serverid` int(11) NOT NULL AUTO_INCREMENT,
    `croodx` double NOT NULL,
    `croody` double NOT NULL,
    `croodz` double NOT NULL,
    `playername` varchar(255) NOT NULL,
    `inplane` boolean NOT NULL,
    `speed` double NOT NULL,
    `heading` double NOT NULL,
    `vehiclemodel` varchar(255) NOT NULL,
    PRIMARY KEY (`serverid`)
) ;
